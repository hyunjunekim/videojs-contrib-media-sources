import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import FlashMediaSource from '../src/flash-media-source';
import HtmlMediaSource from '../src/html-media-source';
// we disable this because browserify needs to include these files
// but the exports are not important
/* eslint-disable no-unused-vars */
import {MediaSource, URL} from '../src/videojs-contrib-media-sources.js';
/* eslint-disable no-unused-vars */

QUnit.module('createObjectURL', {
  beforeEach() {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5.
    this.clock = sinon.useFakeTimers();
    this.oldMediaSource = window.MediaSource || window.WebKitMediaSource;

    // force MediaSource support
    if (!window.MediaSource) {
      window.MediaSource = function() {
        let result = new window.Blob();

        result.addEventListener = function() {};
        result.addSourceBuffer = function() {};
        return result;
      };
    }
  },

  afterEach() {

    // The clock _must_ be restored before disposing the player; otherwise,
    // certain timeout listeners that happen inside video.js may throw errors.
    this.clock.restore();
    this.player.dispose();
    window.MediaSource = window.WebKitMediaSource = this.oldMediaSource;
  }
});

QUnit.test('delegates to the native implementation', function() {
  QUnit.ok(!(/blob:vjs-media-source\//).test(
    videojs.URL.createObjectURL(
      new window.Blob())
    ),
    'created a native blob URL'
  );
});

QUnit.test('uses the native MediaSource when available', function() {
  QUnit.ok(!(/blob:vjs-media-source\//).test(
    videojs.URL.createObjectURL(
      new HtmlMediaSource())
    ),
    'created a native blob URL'
  );
});

QUnit.test('emulates a URL for the shim', function() {
  QUnit.ok((/blob:vjs-media-source\//).test(
    videojs.URL.createObjectURL(
      new FlashMediaSource())
    ),
    'created an emulated blob URL'
  );
});

QUnit.test('stores the associated blob URL on the media source', function() {
  let blob = new window.Blob();
  let url = videojs.URL.createObjectURL(blob);

  QUnit.equal(blob.url_, url, 'captured the generated URL');
});
