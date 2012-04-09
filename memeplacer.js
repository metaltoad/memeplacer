var sources = [];

require('fs').readdir('sources', function (err, files) {
  for (var i = 0; i < files.length; i++) {
    if (files[i].match(/(\d+)x(\d+)\.\d+\.jpg/)) {
      sources.push(files[i]);
    }
  }
  require('http').createServer(listener).listen(1337);
});

/**
 * The main request listener.
 */
function listener(request, response) {
  var url = require('url').parse(request.url)['pathname'];
  var parts, x, y;
  if (
    (parts = url.match(/^\/(\d+)x(\d+)$/)) &&
    request.method == 'GET' &&
    (x = parseInt(parts[1])) && (y = parseInt(parts[2])) &&
    x >= 1 && x <= 1000 && y >= 1 && y <= 1000) {

    streamImage(response, x, y);

  } else {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end('Not found');
  }
}

/**
 * Stream the image.
 */
function streamImage(response, x, y) {

  var geometry = x + 'x' + y;
  var util = require('util'),
    spawn = require('child_process').spawn,
    convert = spawn('convert', ['-quality', '75%', '-resize', geometry + '^', '-gravity', 'center', '-extent', geometry, '-gravity', 'center', 'sources/' + findSource(x, y), '-']);

  response.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'max-age=99999999',
  });
  convert.stdout.pipe(response)
}

/**
 * Find the closest source image
 */
function findSource(x, y) {
  var delta = 999999;
  var targetAspect = x / y;
  var results = [];
  for (var i = 0; i < sources.length; i++) {
    var parts = sources[i].match(/(\d+)x(\d+)\.\d+\.jpg/);
    var sourceAspect = parseInt(parts[1]) / parseInt(parts[2]);
    if (Math.abs(sourceAspect - targetAspect) < delta) {
      delta = Math.abs(sourceAspect - targetAspect);
      results = [sources[i]];
    } else if (Math.abs(sourceAspect - targetAspect) == delta) {
      results.push(sources[i]);
    }
  }
  return results[Math.floor(Math.random() * results.length)];
}