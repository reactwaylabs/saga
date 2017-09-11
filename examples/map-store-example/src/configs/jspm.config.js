SystemJS.config({
    baseURL: "/",
    paths: {
        "npm:": "libs/npm/",
        "github:": "libs/github/"
    },
    packages: {
        "": {
            "meta": {
                "*.css": {
                    "loader": "css"
                }
            }
        }
    }
});

SystemJS.config({
    packageConfigPaths: [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    map: {
        "whatwg-fetch": "npm:whatwg-fetch@2.0.3",
        "assert": "npm:jspm-nodelibs-assert@0.2.1",
        "buffer": "npm:jspm-nodelibs-buffer@0.2.3",
        "child_process": "npm:jspm-nodelibs-child_process@0.2.1",
        "constants": "npm:jspm-nodelibs-constants@0.2.1",
        "crypto": "npm:jspm-nodelibs-crypto@0.2.1",
        "css": "github:systemjs/plugin-css@0.1.35",
        "domain": "npm:jspm-nodelibs-domain@0.2.1",
        "events": "npm:jspm-nodelibs-events@0.2.2",
        "flux": "npm:flux@3.1.2",
        "fs": "npm:jspm-nodelibs-fs@0.2.1",
        "http": "npm:jspm-nodelibs-http@0.2.0",
        "https": "npm:jspm-nodelibs-https@0.2.2",
        "immutable": "npm:immutable@3.8.1",
        "json": "github:systemjs/plugin-json@0.3.0",
        "os": "npm:jspm-nodelibs-os@0.2.1",
        "path": "npm:jspm-nodelibs-path@0.2.3",
        "process": "npm:jspm-nodelibs-process@0.2.1",
        "react": "npm:react@15.5.4",
        "react-dom": "npm:react-dom@15.5.4",
        "simplr-flux": "npm:simplr-flux@2.0.1",
        "stream": "npm:jspm-nodelibs-stream@0.2.1",
        "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.1",
        "url": "npm:jspm-nodelibs-url@0.2.1",
        "util": "npm:jspm-nodelibs-util@0.2.2",
        "vm": "npm:jspm-nodelibs-vm@0.2.1",
        "zlib": "npm:jspm-nodelibs-zlib@0.2.3"
    },
    packages: {
        "npm:simplr-flux@2.0.1": {
            "map": {
                "flux": "npm:flux@3.1.2",
                "immutable": "npm:immutable@3.8.1",
                "action-emitter": "npm:action-emitter@0.2.1",
                "@types/flux": "npm:@types/flux@3.1.0"
            }
        },
        "npm:jspm-nodelibs-crypto@0.2.1": {
            "map": {
                "crypto-browserify": "npm:crypto-browserify@3.11.0"
            }
        },
        "npm:jspm-nodelibs-http@0.2.0": {
            "map": {
                "http-browserify": "npm:stream-http@2.7.2"
            }
        },
        "npm:jspm-nodelibs-buffer@0.2.3": {
            "map": {
                "buffer": "npm:buffer@5.0.6"
            }
        },
        "npm:react-dom@15.5.4": {
            "map": {
                "object-assign": "npm:object-assign@4.1.1",
                "loose-envify": "npm:loose-envify@1.3.1",
                "fbjs": "npm:fbjs@0.8.12",
                "prop-types": "npm:prop-types@15.5.10"
            }
        },
        "npm:react@15.5.4": {
            "map": {
                "object-assign": "npm:object-assign@4.1.1",
                "loose-envify": "npm:loose-envify@1.3.1",
                "fbjs": "npm:fbjs@0.8.12",
                "prop-types": "npm:prop-types@15.5.10"
            }
        },
        "npm:jspm-nodelibs-os@0.2.1": {
            "map": {
                "os-browserify": "npm:os-browserify@0.2.1"
            }
        },
        "npm:flux@3.1.2": {
            "map": {
                "fbjs": "npm:fbjs@0.8.12",
                "fbemitter": "npm:fbemitter@2.1.1"
            }
        },
        "npm:jspm-nodelibs-domain@0.2.1": {
            "map": {
                "domain-browser": "npm:domain-browser@1.1.7"
            }
        },
        "npm:jspm-nodelibs-string_decoder@0.2.1": {
            "map": {
                "string_decoder": "npm:string_decoder@0.10.31"
            }
        },
        "npm:jspm-nodelibs-url@0.2.1": {
            "map": {
                "url": "npm:url@0.11.0"
            }
        },
        "npm:jspm-nodelibs-stream@0.2.1": {
            "map": {
                "stream-browserify": "npm:stream-browserify@2.0.1"
            }
        },
        "npm:jspm-nodelibs-zlib@0.2.3": {
            "map": {
                "browserify-zlib": "npm:browserify-zlib@0.1.4"
            }
        },
        "npm:action-emitter@0.2.1": {
            "map": {
                "fbemitter": "npm:fbemitter@2.1.1",
                "@types/fbemitter": "npm:@types/fbemitter@2.0.32"
            }
        },
        "npm:fbjs@0.8.12": {
            "map": {
                "loose-envify": "npm:loose-envify@1.3.1",
                "object-assign": "npm:object-assign@4.1.1",
                "setimmediate": "npm:setimmediate@1.0.5",
                "isomorphic-fetch": "npm:isomorphic-fetch@2.2.1",
                "ua-parser-js": "npm:ua-parser-js@0.7.12",
                "core-js": "npm:core-js@1.2.7",
                "promise": "npm:promise@7.3.0"
            }
        },
        "npm:prop-types@15.5.10": {
            "map": {
                "fbjs": "npm:fbjs@0.8.12",
                "loose-envify": "npm:loose-envify@1.3.1"
            }
        },
        "npm:crypto-browserify@3.11.0": {
            "map": {
                "create-hash": "npm:create-hash@1.1.3",
                "create-ecdh": "npm:create-ecdh@4.0.0",
                "browserify-cipher": "npm:browserify-cipher@1.0.0",
                "browserify-sign": "npm:browserify-sign@4.0.4",
                "inherits": "npm:inherits@2.0.3",
                "create-hmac": "npm:create-hmac@1.1.6",
                "diffie-hellman": "npm:diffie-hellman@5.0.2",
                "pbkdf2": "npm:pbkdf2@3.0.12",
                "randombytes": "npm:randombytes@2.0.5",
                "public-encrypt": "npm:public-encrypt@4.0.0"
            }
        },
        "npm:stream-http@2.7.2": {
            "map": {
                "inherits": "npm:inherits@2.0.3",
                "readable-stream": "npm:readable-stream@2.2.11",
                "xtend": "npm:xtend@4.0.1",
                "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
                "builtin-status-codes": "npm:builtin-status-codes@3.0.0"
            }
        },
        "npm:fbemitter@2.1.1": {
            "map": {
                "fbjs": "npm:fbjs@0.8.12"
            }
        },
        "npm:@types/flux@3.1.0": {
            "map": {
                "@types/fbemitter": "npm:@types/fbemitter@2.0.32",
                "@types/react": "npm:@types/react@15.0.29"
            }
        },
        "npm:browserify-zlib@0.1.4": {
            "map": {
                "readable-stream": "npm:readable-stream@2.2.11",
                "pako": "npm:pako@0.2.9"
            }
        },
        "npm:buffer@5.0.6": {
            "map": {
                "base64-js": "npm:base64-js@1.2.0",
                "ieee754": "npm:ieee754@1.1.8"
            }
        },
        "npm:stream-browserify@2.0.1": {
            "map": {
                "inherits": "npm:inherits@2.0.3",
                "readable-stream": "npm:readable-stream@2.2.11"
            }
        },
        "npm:loose-envify@1.3.1": {
            "map": {
                "js-tokens": "npm:js-tokens@3.0.1"
            }
        },
        "npm:url@0.11.0": {
            "map": {
                "punycode": "npm:punycode@1.3.2",
                "querystring": "npm:querystring@0.2.0"
            }
        },
        "npm:pbkdf2@3.0.12": {
            "map": {
                "create-hash": "npm:create-hash@1.1.3",
                "create-hmac": "npm:create-hmac@1.1.6",
                "ripemd160": "npm:ripemd160@2.0.1",
                "sha.js": "npm:sha.js@2.4.8",
                "safe-buffer": "npm:safe-buffer@5.1.0"
            }
        },
        "npm:browserify-sign@4.0.4": {
            "map": {
                "create-hash": "npm:create-hash@1.1.3",
                "create-hmac": "npm:create-hmac@1.1.6",
                "inherits": "npm:inherits@2.0.3",
                "browserify-rsa": "npm:browserify-rsa@4.0.1",
                "elliptic": "npm:elliptic@6.4.0",
                "parse-asn1": "npm:parse-asn1@5.1.0",
                "bn.js": "npm:bn.js@4.11.6"
            }
        },
        "npm:create-hash@1.1.3": {
            "map": {
                "inherits": "npm:inherits@2.0.3",
                "ripemd160": "npm:ripemd160@2.0.1",
                "sha.js": "npm:sha.js@2.4.8",
                "cipher-base": "npm:cipher-base@1.0.3"
            }
        },
        "npm:create-hmac@1.1.6": {
            "map": {
                "inherits": "npm:inherits@2.0.3",
                "create-hash": "npm:create-hash@1.1.3",
                "ripemd160": "npm:ripemd160@2.0.1",
                "sha.js": "npm:sha.js@2.4.8",
                "safe-buffer": "npm:safe-buffer@5.1.0",
                "cipher-base": "npm:cipher-base@1.0.3"
            }
        },
        "npm:diffie-hellman@5.0.2": {
            "map": {
                "randombytes": "npm:randombytes@2.0.5",
                "miller-rabin": "npm:miller-rabin@4.0.0",
                "bn.js": "npm:bn.js@4.11.6"
            }
        },
        "npm:readable-stream@2.2.11": {
            "map": {
                "string_decoder": "npm:string_decoder@1.0.2",
                "inherits": "npm:inherits@2.0.3",
                "safe-buffer": "npm:safe-buffer@5.0.1",
                "isarray": "npm:isarray@1.0.0",
                "util-deprecate": "npm:util-deprecate@1.0.2",
                "core-util-is": "npm:core-util-is@1.0.2",
                "process-nextick-args": "npm:process-nextick-args@1.0.7"
            }
        },
        "npm:public-encrypt@4.0.0": {
            "map": {
                "create-hash": "npm:create-hash@1.1.3",
                "randombytes": "npm:randombytes@2.0.5",
                "browserify-rsa": "npm:browserify-rsa@4.0.1",
                "parse-asn1": "npm:parse-asn1@5.1.0",
                "bn.js": "npm:bn.js@4.11.6"
            }
        },
        "npm:isomorphic-fetch@2.2.1": {
            "map": {
                "whatwg-fetch": "npm:whatwg-fetch@2.0.3",
                "node-fetch": "npm:node-fetch@1.7.1"
            }
        },
        "npm:promise@7.3.0": {
            "map": {
                "asap": "npm:asap@2.0.5"
            }
        },
        "npm:randombytes@2.0.5": {
            "map": {
                "safe-buffer": "npm:safe-buffer@5.1.0"
            }
        },
        "npm:create-ecdh@4.0.0": {
            "map": {
                "elliptic": "npm:elliptic@6.4.0",
                "bn.js": "npm:bn.js@4.11.6"
            }
        },
        "npm:browserify-cipher@1.0.0": {
            "map": {
                "browserify-aes": "npm:browserify-aes@1.0.6",
                "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
                "browserify-des": "npm:browserify-des@1.0.0"
            }
        },
        "npm:string_decoder@1.0.2": {
            "map": {
                "safe-buffer": "npm:safe-buffer@5.0.1"
            }
        },
        "npm:ripemd160@2.0.1": {
            "map": {
                "inherits": "npm:inherits@2.0.3",
                "hash-base": "npm:hash-base@2.0.2"
            }
        },
        "npm:sha.js@2.4.8": {
            "map": {
                "inherits": "npm:inherits@2.0.3"
            }
        },
        "npm:elliptic@6.4.0": {
            "map": {
                "bn.js": "npm:bn.js@4.11.6",
                "inherits": "npm:inherits@2.0.3",
                "brorand": "npm:brorand@1.1.0",
                "hash.js": "npm:hash.js@1.0.3",
                "hmac-drbg": "npm:hmac-drbg@1.0.1",
                "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
                "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
            }
        },
        "npm:browserify-rsa@4.0.1": {
            "map": {
                "bn.js": "npm:bn.js@4.11.6",
                "randombytes": "npm:randombytes@2.0.5"
            }
        },
        "npm:parse-asn1@5.1.0": {
            "map": {
                "browserify-aes": "npm:browserify-aes@1.0.6",
                "create-hash": "npm:create-hash@1.1.3",
                "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
                "pbkdf2": "npm:pbkdf2@3.0.12",
                "asn1.js": "npm:asn1.js@4.9.1"
            }
        },
        "npm:browserify-aes@1.0.6": {
            "map": {
                "cipher-base": "npm:cipher-base@1.0.3",
                "create-hash": "npm:create-hash@1.1.3",
                "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
                "inherits": "npm:inherits@2.0.3",
                "buffer-xor": "npm:buffer-xor@1.0.3"
            }
        },
        "npm:cipher-base@1.0.3": {
            "map": {
                "inherits": "npm:inherits@2.0.3"
            }
        },
        "npm:miller-rabin@4.0.0": {
            "map": {
                "bn.js": "npm:bn.js@4.11.6",
                "brorand": "npm:brorand@1.1.0"
            }
        },
        "npm:evp_bytestokey@1.0.0": {
            "map": {
                "create-hash": "npm:create-hash@1.1.3"
            }
        },
        "npm:browserify-des@1.0.0": {
            "map": {
                "cipher-base": "npm:cipher-base@1.0.3",
                "inherits": "npm:inherits@2.0.3",
                "des.js": "npm:des.js@1.0.0"
            }
        },
        "npm:node-fetch@1.7.1": {
            "map": {
                "is-stream": "npm:is-stream@1.1.0",
                "encoding": "npm:encoding@0.1.12"
            }
        },
        "npm:hash-base@2.0.2": {
            "map": {
                "inherits": "npm:inherits@2.0.3"
            }
        },
        "npm:hash.js@1.0.3": {
            "map": {
                "inherits": "npm:inherits@2.0.3"
            }
        },
        "npm:hmac-drbg@1.0.1": {
            "map": {
                "hash.js": "npm:hash.js@1.0.3",
                "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
                "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1"
            }
        },
        "npm:asn1.js@4.9.1": {
            "map": {
                "bn.js": "npm:bn.js@4.11.6",
                "inherits": "npm:inherits@2.0.3",
                "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
            }
        },
        "npm:des.js@1.0.0": {
            "map": {
                "inherits": "npm:inherits@2.0.3",
                "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
            }
        },
        "npm:encoding@0.1.12": {
            "map": {
                "iconv-lite": "npm:iconv-lite@0.4.18"
            }
        }
    }
});
