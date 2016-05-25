(function (require) {
    'use strict';
    require.config({
        baseUrl: '../../public/js/vendor',
        shim: {
            jquery: {
                exports: "$"
            },
            ajax: {
                deps: ['jquery']
            },
            handlebars: {
                exports: "Handlebars"
            },
            cookie: {
                deps: ['jquery']
            },
            json: {
                deps: ['jquery']
            },
            info: {
                deps: ['jquery']
            },
            dialog: {
                deps: ['jquery']
            },
            choice: {
                deps: ['jquery']
            },
            chosen: {
                deps: ['jquery']
            },
            placeholder: {
                deps: ['jquery']
            },
            tab: {
                deps: ['jquery']
            },
            affix: {
                deps: ['jquery']
            },
            scrollspy: {
                deps: ['jquery']
            },
            store: {
                deps: ['json']
            },
            carousel: {
                deps: ['jquery']
            },
            formVerified: {
                deps: ['jquery']
            },
            dummy: {
                exports: "dummy"
            }
        },
        paths: {
            "serviceList": "/sys/sers",
            "serviceCtrl": "serviceCtrl",
            "jquery": "jquery.min",
            "ajax": "ajaxFactory",
            "json": "jquery.json.min",
            "cookie": "jquery.cookie",
            "addrs": "address",
            "sersAddrs": "/sys/serviceAddress",
            "experts": "experts",
            "addrsCtrl": "addrsCtrl",
            "sersAddrsCtrl": "sersAddrsCtrl",
            "share": "share",
            "info": "info",
            "loginBox": "loginBox",
            "dialog": "dialog",
            "tab": "tab",
            "scrollspy": "bootstrap-scrollspy",
            "choice": "choice",
            "chosen": "chosen",
            "placeholder": "placeholder",
            "affix": "affix",
            "store": "store",
            "common": "common",
            "formVerified": "formVerified",
            "paginate": "paginate",
            "dummy": "dummy",
            "handlebars": "handlebars.amd.min",
            "carousel": "carousel"
        }
    });
}(window.require));
