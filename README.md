# SHS

> Simple HTTP Server based on build-in net module.

基于内置的 `net` module，希望参照 `http` module API 并结合 [rfc 1945](https://tools.ietf.org/html/rfc1945) 实现一个足够简单的 HTTP Server。

之所以选择 HTTP/1.0 只是因为相比于后面的版本足够简单，规范仅仅50+页。

## Usage

- `git clone`
- `node index.js`
- visit `http://127.0.0.1:4000/some/path`