TIMEOUT = 5000
SLOW = 500
MOCHA_OPTS = --compilers coffee:coffee-script/register --timeout $(TIMEOUT) --slow $(SLOW)
TESTS = $(shell find ./test/* -name "*.test.coffee")
REPORTER = spec

test:
	@NODE_ENV=test DEBUG=socket.io-client:*,benchmark:*,socket.js ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--slow 200ms \
		--bail

start:
	@DEBUG=* ./bin/nb -n 100 -c 10000 http://localhost:3000/user

coffee-test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter spec \
		$(MOCHA_OPTS) \
		test/**/*.test.coffee

test-cov:
	@./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- \
		--reporter $(REPORTER) \
		test/

.PHONY: test
