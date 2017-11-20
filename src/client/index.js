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


class Message {
    constructor (author, text) {
        this.author = author;
        this.text = text;
        this.isSend = false;
    }
}

class Messages {
    constructor ($http, $timeout) {
        this._$http = $http;
        this._$timeout = $timeout;
        this.items = [
        ];
    }

    loadHistory () {
        this._$http
            .get('assets/messages.json')
            .then((response) => {
                response.data.forEach((item) => {
                    let msg = this.append(item.author, item.text);
                    msg.isSend = true;
                })
            });
    }

    append (user, text) {
        let message = new Message(user, text);
        this.items.push(message);
        return message
    }

    send (user, text) {
        let message = this.append(user, text);
        this._$timeout(
            () => {message.isSend = true;},
            1000 + Math.floor(Math.random()*1000),
        )
    }
}
Messages.$inject = [
    '$http',
    '$timeout',
]
ngModule.service('TMessages', Messages);

ngModule.controller('ChatCtrl', [
    '$scope',
    'TMessages',
    function ($scope, tMessages) {
        $scope.messages = tMessages;
        $scope.currentUserMessage = '';
        $scope.send = () => {
            $scope.messages.send(
                'user',
                $scope.currentUserMessage
            );
            $scope.currentUserMessage = '';
        };
        $scope.messages.loadHistory();
    }
]);

angular.element(document).ready(() => {
    angular.bootstrap(document.body, [ngModule.name]);
});
