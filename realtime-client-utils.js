/**
 * @license
 * Realtime Utils 1.0.0
 * https://developers.google.com/google-apps/realtime/overview
 * Copyright 2015 Seth Howard, Google Inc. All Rights Reserved.
 * Realtime Utils may be freely distributed under the Apache 2.0 license.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Common utility functionality for the Google Realtime API,
 * including authorization and file loading.
 */

/**
 * Create the utils namespace
 */
window.utils = {};

/**
 * @constructor
 * @param {!Object} options for the realtime utility. One key is mandatory:
 *
 *  1) "clientId" the client id from the APIs console.
 *
 */
utils.RealtimeUtils = function(options) {
  this.init(options);
};

utils.RealtimeUtils.prototype = {

  /**
   * clientId for this realtime application.
   * @type {!string}
   */
  clientId: null,

  /**
   * MimeType for this realtime application.
   * @type {!string}
   */
  mimeType: 'application/vnd.google-apps.drive-sdk',

  /**
   * The interval at which the oauth token will attempt to be refreshed.
   * @type {!string}
   */
  refreshInterval: 1800000, // 30 minutes

  /**
   * Required scopes.
   * @type {!Array<string>}
   */
  scopes: [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive.file'
  ],

  /**
   * Initializes RealtimeUtils
   * @param {Object} options containing required utility keys.
   * @private
   */
  init: function(options) {
    this.mergeOptions(options);
    this.authorizer = new utils.RealtimeAuthorizer(this);
    this.createRealtimeFile = this.createRealtimeFile.bind(this);
  },

  /**
   * Kicks off the authorization process
   * @param {!Function} onAuthComplete callback invoked after authorizing.
   * @param {!boolean} usePopup true if authenticating via a popup window.
   * @export
   */
  authorize: function(onAuthComplete, usePopup) {
    this.authorizer.start(onAuthComplete, usePopup);
  },

  /**
   * Merges passed-in options with default options.
   * @param {Object} options that will be merged with existing options.
   * @private
   */
  mergeOptions: function(options) {
    for (var option in options) {
      this[option] = options[option];
    }
  },

  /**
   * Examines url query parameters for a specific parameter.
   * @param {!string} urlParam to search for in url parameters.
   * @return {?(string)} returns match as a string or null if no match.
   * @export
   */
  getParam: function(urlParam) {
    var regExp = new RegExp(urlParam + '=(.*?)($|&)', 'g');
    var match = window.location.search.match(regExp);
    if (match && match.length) {
      match = match[0];
      match = match.replace(urlParam + '=', '').replace('&', '');
    } else {
      match = null;
    }
    return match;
  },

  /**
   * Creates a new realtime file.
   * @param {!string} title for the new realtime document.
   * @param {Function} callback to be executed once the file has been created.
   * @export
   */
  createRealtimeFile: function(title, callback) {
    var that = this;
    window.gapi.client.load('drive', 'v2', function() {
      var insertHash = {
        'resource': {
          mimeType: that.mimeType,
          title: title
        }
      };
      window.gapi.client.drive.files.insert(insertHash).execute(callback);
    });
  },

  /**
   * Loads an existing realtime file.
   * @param {!string} documentId for the document to load.
   * @param {!function(gapi.drive.realtime.Document): undefined} onFileLoaded
   *     to be executed once the file has been loaded.
   * @param {!function(gapi.drive.realtime.Model): undefined} initializeModel
   *     will be executed if this is the first time this file has been loaded.
   * @export
   */
  load: function(documentId, onFileLoaded, initializeModel) {
    var that = this;
    window.gapi.drive.realtime.load(documentId, function(doc) {
      window.doc = doc;  // Debugging purposes
      onFileLoaded(doc);
    }, initializeModel, this.onError.bind(this));
  },

  /**
   * Handles errors that occurred during document load.
   * @param {gapi.drive.realtime.Error} error containing specific realtime
   *     details.
   * @private
   */
  onError: function(error) {
    if (error.type == window.gapi.drive.realtime.ErrorType
        .TOKEN_REFRESH_REQUIRED) {
      this.authorizer.authorize(function() {
        console.log('Error, auth refreshed');
      }, false);
    } else if (error.type == window.gapi.drive.realtime.ErrorType
        .CLIENT_ERROR) {
      alert('An Error happened: ' + error.message);
      window.location.href = '/';
    } else if (error.type == window.gapi.drive.realtime.ErrorType.NOT_FOUND) {
      alert('The file was not found. It does not exist or you do not have ' +
        'read access to the file.');
      window.location.href = '/';
    } else if (error.type == window.gapi.drive.realtime.ErrorType.FORBIDDEN) {
      alert('You do not have access to this file. Try having the owner share' +
        'it with you from Google Drive.');
      window.location.href = '/';
    }
  }
};


/**
  * @constructor
  * @param {utils.RealtimeUtils} realtimeUtil that owns this
  *     RealtimeAuthorizer instance.
  *
  */
utils.RealtimeAuthorizer = function(realtimeUtil) {
  this.util = realtimeUtil;
  this.handleAuthResult = this.handleAuthResult.bind(this);
  this.token = null;
};

utils.RealtimeAuthorizer.prototype = {

  /**
   * Starts the authorizer
   * @param {!Function} onAuthComplete callback invoked after authorizing.
   * @param {boolean} usePopup true if authenticating via a popup window.
   * @export
   */
  start: function(onAuthComplete, usePopup) {
    var that = this;
    window.gapi.load('auth:client,drive-realtime,drive-share', {
      callback: function() {
        that.authorize(onAuthComplete, usePopup);
      }
    });
    if (this.authTimer) {
      window.clearTimeout(this.authTimer);
    }
    this.refreshAuth();
  },

  /**
   * Attempts to authorize.
   * @param {!Function} onAuthComplete callback invoked after authorizing.
   * @param {boolean} usePopup true if authenticating via a popup window.
   * @private
   */
  authorize: function(onAuthComplete, usePopup) {
    this.onAuthComplete = onAuthComplete;
    // Try with no popups first.
    window.gapi.auth.authorize({
      client_id: this.util.clientId,
      scope: this.util.scopes,
      immediate: !usePopup
    }, this.handleAuthResult);
  },

  /**
   * Handles the auth result before invoking the user supplied callback.
   * @param {Object} authResult from the drive service containing details about
   *     this authorization attempt.
   * @private
   */
  handleAuthResult: function(authResult) {
    if (authResult && !authResult.error) {
      this.token = authResult.access_token;
    }
    this.onAuthComplete(authResult);
  },

  /**
   * Sets a timer that will refresh the oauth token after an interval.
   * @private
   */
  refreshAuth: function() {
    var that = this;
    this.authTimer = setTimeout(function() {
      that.authorize(function() {
        console.log('Refreshed Auth Token');
      }, false);
      that.refreshAuth();
    }, this.util.refreshInterval);
  }
};