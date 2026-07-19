# Health Check Test
GET http://localhost:8080

# We should get back an HTTP 1.1 200 response
HTTP/1.1 200
# We should get back a non-cacheable response (cache-control header)
Cache-Control: no-cache

# Extra checks to perform against the response
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
