hensApp.controller("IrlForm", ["$scope", "$rootScope", "eventsFactory",
    function ($scope, $rootScope, eventsFactory) {
        $scope.$parent.info.isAppInit = false;
        const excludedFields = ["id", "created_at", "user_id"];
        $scope.Steps = Object.freeze({
            Intro: "Intro",
            Infos: "Infos",
            Activities: "Activities",
            payment: "Paiement",
            Confirmation: "Confirmation"
        });
        $scope.villages = $rootScope.villages;
        $scope.Regimes = ["Omni", "Végétarien", "Vegan"];
        $scope.Choix = ["Non", "Oui"];
        $scope.MaybeChoices = ["Non", "Oui", "Je ne sais pas"];
        $scope.formFields = [
            "payment",
            "village",
            "plus_one",
            "plus_one_name",
            "plus_one_village",
            "regime",
            "allergies",
            "linge",
            "event_enigme",
            "event_sport",
            "event_rp",
        ];
        $scope.fieldTitles = {
            village: "Village",
            plus_one: "Viendras-tu avec un +1 ?",
            plus_one_name: "Pseudo de ton +1",
            plus_one_village: "Quel sera le village de ton +1 ?",
            regime: "Informations relatives aux repas. Régime particulier ?",
            allergies: "Allergies ? Intolérances ?",
            linge: "Pourras-tu amener du linge de lit (92x200cm) ? (alaise, draps...)",
            event_enigme: "Souhaites-tu participer aux activités en groupe type énigme ?",
            event_sport: "Souhaites-tu participer aux activités en groupe type sportif ?",
            event_rp: "Souhaites-tu participer aux activités en groupe type jeu de rôle GN ?",
            payment: "Paiement (validé à la main par nos soins, il peut y avoir un délai)"//server only field
        };

        $scope.fieldTypes = {
            payment: "text",
            village: "village",
            plus_one: "radio",
            plus_one_name: "text",
            plus_one_village: "village",
            regime: "radio",
            allergies: "text",
            linge: "radio",
            event_enigme: "radio_maybe",
            event_sport: "radio_maybe",
            event_rp: "radio_maybe",
        };

        $scope.errors = [];
        $scope.defaultFormData = () => {
            return {
                village: null,
                plus_one: null,
                plus_one_name: "",
                plus_one_village: null,
                regime: null,
                allergies: "",
                linge: null,
                event_enigme: null,
                event_sport: null,
                event_rp: null
            };
        }
        $scope.formData = $scope.defaultFormData();

        $scope.CurrentStep = $scope.Steps.Intro;
        $scope.StepChecks = {
            Infos: ["village", "plus_one", "plus_one_name", "plus_one_village", "regime", "linge"],
            Activities: ["event_enigme", "event_sport", "event_rp"],
        };

        $scope.validateFields = (fields) => {
            const defaultValues = $scope.defaultFormData();
            const errors = [];
            fields.forEach(field => {
                if ($scope.formData[field] == defaultValues[field]) {
                    if (field.includes("plus_one_")) {
                        if ($scope.formData.plus_one == true) {
                            errors.push(field);
                        }
                    }
                    else {
                        errors.push(field);
                    }
                }
            });
            return errors;
        }

        $scope.goToStep = (step) => {
            if (!Object.values($scope.Steps).includes(step)) {
                $rootscope.setAlert("error", `${step} n'existe pas dans les étapes du formulaire.`);
                return;
            }
            if (Object.keys($scope.StepChecks).includes($scope.CurrentStep)) {
                $scope.errors = $scope.validateFields($scope.StepChecks[$scope.CurrentStep]);
            }
            if ($scope.errors.length == 0) {
                $scope.CurrentStep = step;
            }
            else {
                console.log(`Erreurs dans les champs: ${$scope.errors.join(", ")}. Veuillez corriger.`, $scope.formData);
            }
        };

        $scope.goToPayLater = function () {
            $scope.errors = $scope.validateFields($scope.StepChecks[$scope.CurrentStep]);
            if ($scope.errors.length == 0) {
                $scope.submitForm()
                    .then((result) => {
                        $scope.existingForm = result.data;
                        $scope.showExistingForm = true;
                    })
                    .catch(error => { $rootscope.setAlert("error", error); });
            }
        };

        $scope.goToPaypal = function () {
            $scope.errors = $scope.validateFields($scope.StepChecks[$scope.CurrentStep]);
            if ($scope.errors.length == 0) {
                $scope.submitForm()
                    .then((result) => {
                        $scope.existingForm = result.data;
                        $scope.showExistingForm = true;

                        //todo payment.
                        setTimeout(() => {
                            window.open("http://paypal.me/hensworld", '_blank').focus();
                        }, 500);
                    })
                    .catch(error => {
                        $rootScope.setAlert("error", error.data ? error.data : error);
                    });
            }
        };

        $scope.submitForm = function () {
            $scope.formData.linge = !!$scope.formData.linge;
            $scope.formData.plus_one = !!$scope.formData.plus_one;
            if ($scope.existingForm) {
                return eventsFactory.irlHens.editFormulaire($scope.formData, $scope.existingForm.id);
            }
            else {
                return eventsFactory.irlHens.postFormulaire($scope.formData);
            }
        };

        $scope.setFormValue = (field, value) => {
            $scope.formData[field] = value;
            console.log(`Set ${field} to ${value}`);
        };
        $scope.editForm = () => {
            $scope.showExistingForm = false;
            $scope.CurrentStep = $scope.Steps.Intro;
            $scope.formData = hensApp.clone($scope.existingForm);
            $scope.goToStep($scope.Steps.Infos);
        };

        /*** INIT */
        eventsFactory.irlHens.getForm().then(result => {
            $scope.$parent.info.isAppInit = true;
            $scope.existingForm = result.data;
            if ($scope.existingForm) {
                $scope.showExistingForm = true;
            }
        });

    }
]);