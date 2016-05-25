(function (require) {
    'use strict';
    require.config({
        baseUrl: '//www.ycs.com/public/js/vendor',
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
            addressBox: {
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
            share: {
                deps: ['jquery']
            },
            affix: {
                deps: ['jquery']
            },
            scrollspy: {
                deps: ['jquery']
            },
            mousewheel: {
                deps: ['jquery']
            },
            dragScroll: {
                deps: ['mousewheel']
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
            },
            superSlide: {
                deps: ['jquery']
            },
            glide: {
                deps: ['jquery']
            },
            dial: {
                deps: ['jquery']
            },
            slide: {
                deps: ['jquery']
            }
        },
        paths: {
            "serviceList": "//www.ycs.com/sys/sers",
            "serviceCtrl": "serviceCtrl",
            "jquery": "jquery.min",
            "ajax": "ajaxFactory",
            "json": "jquery.json.min",
            "cookie": "jquery.cookie",
            "addrs": "address",
            "industry": "industry",
            "sersAddrs": "//www.ycs.com/sys/serviceAddress",
            "experts": "experts",
            "addrsCtrl": "addrsCtrl",
            "sersAddrsCtrl": "sersAddrsCtrl",
            "share": "share",
            "info": "info",
            "glide": "glide",
            "dial": "dial",
            "loginBox": "loginBox",
            "dialog": "dialog",
            "tab": "tab",
            "addressBox": "addressBox",
            "mousewheel": "jquery.mousewheel.min",
            "dragScroll": "jquery.dragScroll",
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
