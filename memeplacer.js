var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    util = require('util'),
    child_process = require('child_process');

var sources = [];

fs.readdir('sources', function(err, files) {
  for (var i = 0; i < files.length; i++) {
    if (files[i].match(/(\d+)x(\d+)\.\d+\.jpg/)) {
      sources.push(files[i]);
    }
  }
  http.createServer(listener).listen(8000);
});

/**
 * The main request listener.
 */
function listener(request, response) {
  var uri = url.parse(request.url)['pathname'];
  var parts, x, y;
  var gray = false;
  if (uri.match(/^\/g\//)) {
    uri = uri.replace('/g', '');
    gray = true;
  }
  if (
    (parts = uri.match(/^\/(\d+)x(\d+)$/)) &&
    request.method == 'GET' &&
    (x = parseInt(parts[1])) && (y = parseInt(parts[2])) &&
    x >= 1 && x <= 1000 && y >= 1 && y <= 1000) {

    streamImage(response, x, y, gray);
  } else if (request.method == 'GET' && !uri.match(/\.\./)) {
    streamFile(response, uri);
  } else {
    notFound(response);
  }
}

/**
 * Stream the image.
 */
function streamImage(response, x, y, gray) {

  var geometry = x + 'x' + y;
  var params = ['-quality', '75%', '-resize', geometry + '^', '-gravity', 'center', '-extent', geometry, '-gravity', 'center', 'sources/' + findSource(x, y), '-'];
  if (gray) {
    params.unshift('-colorspace', 'gray');
  }
  var spawn = child_process.spawn,
    convert = spawn('convert', params);

  response.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=99999999',
  });
  convert.stdout.pipe(response);
}

/**
 * Find the closest source image
 */
function findSource(x, y) {
  var delta;
  var targetAspect = x / y;
  var results = [];
  for (var i = 0; i < sources.length; i++) {
    var parts = sources[i].match(/(\d+)x(\d+)\.\d+\.jpg/);
    var sourceAspect = parseInt(parts[1]) / parseInt(parts[2]);
    if (Math.abs(sourceAspect - targetAspect) < delta || !delta) {
      delta = Math.abs(sourceAspect - targetAspect);
      results = [sources[i]];
    } else if (Math.abs(sourceAspect - targetAspect) == delta) {
      results.push(sources[i]);
    }
  }
  return results[Math.floor(Math.random() * results.length)];
}

/**
 * A file server made of mud and sticks.
 */
function streamFile(response, uri) {
  uri = (uri == '/') ? '/index.html' : uri;
  var fileStream = fs.createReadStream('files' + uri);
  fileStream.on('error', function () { notFound(response); });
  response.writeHead(200, {
    'Content-Type': mimeType(uri),
    'Cache-Control': 'public, max-age=300',
  });
  fileStream.pipe(response);
}

/**
 * Get the MIME type for a file.
 */
function mimeType(filename) {
  var types = {
    '.html' : 'text/html',
    '.css'  : 'text/css',
    '.js'   : 'application/javascript',
    '.jpg'  : 'image/jpeg',
    '.jpeg'  : 'image/jpeg',
    '.png'  : 'image/png',
  };
  var i = filename.lastIndexOf('.');
  var extension = (i < 0) ? '' : filename.substr(i);
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * 404.
 */
function notFound(response) {
  response.writeHead(404, {
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=300',
  });
  response.end('Not Found');
}