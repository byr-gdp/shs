const net = require('net');

function getRequestInfoFromRequestLine(requestLineString, request) {
  const array = requestLineString.split(' ');

  request.method = array[0]; // eslint-disable-line prefer-destructuring
  request.url = array[1]; // eslint-disable-line prefer-destructuring
  request.version = array[2].slice(array[2].indexOf('/') + 1);
}

function getRequestInfoFromRequestHeader(requestHeaderString, request) {
  const array = requestHeaderString.split('\r\n');
  console.log(array);
  const headers = {};
  array.forEach((header) => {
    const kvs = header.split(':');
    headers[kvs[0].trim()] = kvs[1].trim();
  });
  request.headers = headers;
}

function getRequestInfoFromRequestBody(requestBodyString, request) {
  if (request.headers['Content-Type'] === 'application/json') {
    try {
      const body = JSON.parse(requestBodyString);
      request.body = body;
    } catch (e) {
      console.error('body 反序列化失败');
      request.body = requestBodyString;
    }
  } else {
    console.log('Content-Type is:', request.headers['Content-Type']);
  }
}

function handleConnection(socket) {
  socket.on('data', (chunk) => {
    console.log('chunk is:\n');
    console.log(chunk.toString());

    // 从 chunk 解析 header 和 body
    const chunkString = chunk.toString();
    const gapMark = '\r\n\r\n'; // header 和 body 中间是一行 \r\n 分割
    const lines = chunkString.split('\r\n');
    const requestLineString = lines[0];
    const requestString = lines.slice(1).join('\r\n');
    const emptyLineIndex = requestString.indexOf(gapMark);
    const requestHeaderString = requestString.slice(0, emptyLineIndex);
    const requestBodyString = requestString.slice(emptyLineIndex + gapMark.length);

    console.log('request line:');
    console.log(requestLineString);
    console.log('header:');
    console.log(requestHeaderString);
    console.log('body:');
    console.log(requestBodyString);

    /**
     * request 对象，提供请求基本信息，如 url、method、headers
     */
    const request = {};
    getRequestInfoFromRequestLine(requestLineString, request);
    getRequestInfoFromRequestHeader(requestHeaderString, request);
    getRequestInfoFromRequestBody(requestBodyString, request);
    console.log('request is:\n', request);

    /**
     * response 对象，提供响应若干方法，如 setHeaders、write、end、setStatus
     */
    const text = 'hello world';
    const response = {
      responseHeaders: {
        'x-powered-by': 'gdp',
      },
      setHeaders() {
        // 写入状态行 ojbk 浏览器也可以识别...
        socket.write('HTTP/1.1 200 OJBK\r\n');

        // 写入 Content-Length，这里必须严格相等，否则 pending 或者 error。除非用 chunk。
        socket.write(`Content-Length: ${text.length}\r\n`);

        // 写入响应头
        Object.keys(this.responseHeaders).forEach((key) => {
          socket.write(`${key}: ${this.responseHeaders[key]}\r\n`);
        });

        // 头部结束
        socket.write('\r\n');
      },
      write(chunk) { // eslint-disable-line
        this.setHeaders();
        socket.end(chunk);
      },
    };

    response.write(text);
  });
}

const server = net.createServer();
server.on('connection', handleConnection);
server.listen(4000);
