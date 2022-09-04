angular.module('app').factory('accountFactory', ['$http', '$rootScope', function ($http, $rootScope) {
    const declareRoute = hensApp.declareFactoryRoute('account', $http, $rootScope);
    return {
        login(login, password) {
            return declareRoute('post', '/login', {
                login: login,
                password: password
            });
        },
        disconnect() {
            return declareRoute('post', '/disconnect');
        },
        register(login, email, password, password_confirm) {
            return declareRoute('post', '/register', {
                accountName: login,
                password: password,
                passwordConfirm: password_confirm,
                email: email
            })
        },
        updateParameters(data) {
            return declareRoute('put', '/parameters', data);
        },
        activateAccount(key) {
            return declareRoute('post', '/activate/' + key, {});
        },
        getParameters() {
            return declareRoute('get', '/parameters');
        },
        saveParameters(mask) {
            return declareRoute('put', '/parameters', {
                mask: mask
            })
        },
        sendForgotPasswordRequest(email) {
            return declareRoute('post', '/reset-password', {
                email: email
            })
        },
        createVillageMeta(village) {
            return declareRoute('post', '/village', {
                village: village
            });
        },
        selectVillage(village) {
            return declareRoute('patch', '/village', {
                village: village
            });
        },
        /**
         *
         * @param data {domains: string, mailBody: string}
         */
        askContributorAccess(data){
            return declareRoute("post", "/contributor-request", data);
        },
        getUnlockedThemes() {
            return declareRoute('get', '/themes');
        },
        /**
         *  updates password when connected
         * @param data {password: string, newPassword:S string, newPasswordRepeat: string}
         * @return promise
         */
        updatePassword(data) {
            return declareRoute('put', '/password', data);
        },
        resetPassword(key, password, password_confirm) {
            return declareRoute('put', '/reset-password', {
                key: key,
                password: password,
                passwordConfirm: password_confirm
            });
        },
        getMyExternalId() {
            return declareRoute('get', '/external-id');
        },
        generateExternalId() {
            return declareRoute('post', '/external-id')
        }
    }
}]);