import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngMaterial from 'angular-material';
import 'normalize.css';
import 'angular-material/angular-material.css';

let ngModule = angular.module(
    'Test', [
        ngAnimate,
        ngMaterial,
    ]
);

ngModule.value('currentUser', {
    icon: 'http://placeowl.com/64/64/one',
    name: 'CU',
});


ngModule.factory('TMessage', [
    '$q',
    function ($q) {
        class Message {
            constructor (author, text) {
                let defer = $q.defer()
                this.author = author;
                // Экранирование...
                this.text = text.replace('<','').replace('>','');
                this.isSend = false
                this.whenSend = defer.promise;
                this.ready = defer.resolve;
                this.whenSend.then(() => {this.isSend=true});
            }
        }
        return Message;
    }
]);


class Messages {
    constructor ($http, $timeout, $q, Message) {
        this._$http = $http;
        this._$timeout = $timeout;
        this._Message = Message;
        this.items = [
        ];
    }

    loadHistory () {
        this._$http
            .get('assets/messages.json')
            .then((response) => {
                response.data.forEach((item) => {
                    let msg = this.append(item.author, item.text);
                    msg.ready();
                })
            });
    }

    append (user, text) {
        let message = new this._Message(user, text);
        this.items.push(message);
        return message
    }

    send (user, text) {
        let message = this.append(user, text);
        this._$timeout(
            message.ready,
            1000 + Math.floor(Math.random()*1000),
            message,
        )
    }
}
Messages.$inject = [
    '$http',
    '$timeout',
    '$q',
    'TMessage'
]
ngModule.service('TMessages', Messages);

ngModule.controller('ChatCtrl', [
    '$scope',
    'TMessages',
    'currentUser',
    function ($scope, tMessages, currentUser) {
        $scope.messages = tMessages;
        $scope.currentUserMessage = '';
        $scope.send = () => {
            $scope.messages.send(
                currentUser,
                $scope.currentUserMessage
            );
            $scope.currentUserMessage = '';
        };
        $scope.messages.loadHistory();
    }
]);

ngModule.directive('tMessages', function () { return {
    scope: {
        messages: '<'
    },
    controller: [
        '$scope',
        '$element',
        '$compile',
        function ($scope, $element, $compile) {
            let messagesLength = 0;
            let elem = $element[0];

            const renderMessage = (message) => {
                let tpl = `
                <md-list-item class="md-3-line" ng-click="null">
                    <img ng-src="${message.author.icon}" class="md-avatar"/>
                    <div class="md-list-item-text" layout="column">
                        <h4>${message.author.name}</h4>
                        <p>${message.text}</p>
                    </div>
                    <md-progress-circular
                        class="md-hue-2"
                        md-diameter="20px"
                    ></md-progress-circular>
                </md-list-item>`

                let rendered = $compile(tpl)($scope);
                message.whenSend.then(()=> {
                    rendered.find('md-progress-circular').detach();
                });
                $element.append(rendered);
            }
            $scope.$watch('messages', (messages) => {
                if (messagesLength < messages.length) {
                    let messagesToRender = messages.slice(
                        messagesLength,
                        messages.length,
                    );
                    messagesToRender.forEach(renderMessage);
                }
                messagesLength = messages.length;
                elem.scrollTop = elem.scrollHeight;
            }, true);
        }
    ]
}});

angular.element(document).ready(() => {
    angular.bootstrap(document.body, [ngModule.name]);
});
