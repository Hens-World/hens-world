angular.module('app').factory('formFactory', ['$rootScope', function ($rootScope) {
  let factory;
  this.registeredForms = [];
  this.TT = {
    error: {
      not_connected: "Il faut être connecté pour pouvoir faire ça :(",
      unauthorized: "Vous n'avez pas les droits nécessaire pour accéder à cela",
      message_short: "Message trop court!",
      bad_request: "Requête mal exécutée.",
      server01: 'Vous avez été déconnecté! Il s\'agit sûrement d\'un redémarrage du serveur. Si le problème persiste, écrivez nous à contact@hens-world.com',
      server02: 'Connexion refusée au serveur de tchat, veuillez vous déconnecter et vous reconnecter à Hens World. ',
      login01: 'Identifiant ou mot de passe incorrect. Veuillez réessayez.',
      message_empty: "Votre message est vide!",
      creation_nolieu: "Vous n'avez pas choisi de lieu pour votre création, veuillez réessayer.",
      creation_notitre: "Veuillez entre un titre pour votre Création",
      annonce_full: "L'annonce est déjà remplie, vous ne pouvez pas la rejoindre.",
      annonce_short_title: "Le titre de votre annonce est trop court!",
      annonce_short_desc: "La description de votre annonce est trop courte!",
      annonce_leave_homeless: "Vous ne pouvez participez pas à cette annonce.",
      date_past: "Vous ne pouvez pas renseigner une date déjà passée!",
      annonce_empty: "Cette annonce n'existe pas. Il s'agit sûrement d'une erreur serveur, contactez nous par mail à: contact@hens-world.fr",
      invite_full: "Vous ne pouvez pas inviter une personne de plus, la partie est déjà pleine",
      roleplay_unauthorized: "Vous n'êtes pas authorisé à écrire dans cette partie.",
      roleplay_wrongturn: "Ce n'es pas encore à votre tour d'écrire.",
      roleplay_private: "Cette partie est privée, désolé!",
      roleplay_full: "Cette partie est déjà pleine!",
      roleplay_finished: "Ce roleplay est déjà terminé, vous n'avez plus le droit de le modifier!",
      email_invalid: "L'adresse mail renseignée est invalide",
      email_exists: "Cette adresse email existe déjà",
      name_short: "Ce nom est trop court! 3 caractères minimum",
      name_exists: "Ce nom de compte est déjà pris",
      name_invalid: "Ce nom de compte est invalide",
      password_short: "Mot de passe trop court",
      password_no_match: "Les mots de passes renseignés sont différents",
      like_exists: "Vous avez déjà liké cette création. Il s'agit sûrement d'un bug",
      bad_activation_key: "Cette clé de validation n'est pas valide",
      reset_pw_invalid: 'la clé de réinitialisation du mot de passe n\'existe pas ou est perimée.',
      user_rank_exists: "Vous possedez déjà ce rang",
    },
    success: {
      server01: 'Vous avez été reconnecté au serveur de tchat! ',
      message_sent: 'Message envoyé!',
      creation_delete: "Création supprimée!",
      creation_post: "Votre création %v à été postée !",
      annonce_left: "Vous avez bien quitté l'annonce",
      annonce_edit: "Edition de l'annonce réussie!",
      annonce_invite_accept: "Vous avez bien accepté cette annonce",
      annonce_invite_decline: "Vous avez refusé de participer à cette annonce",
      annonce_create: "Annonce créée! Vous pouvez l'éditer à tout moment pour aider à l'organisation!",
      annonce_close: "L'annonce à été fermée avec Succès! S'il s'agit d'une erreur, contactez nous par mail: contact@hens-world.fr",
      relation_create: "Relation créée!",
      relation_edit: "Relation éditée avec succès!",
      relation_delete: "Relation supprimée.",
      roleplay_message_edited: "Message correctement édité!",
      roleplay_edited: "Partie correctement éditée!"
    }
  };

  this.translateMessage = (type, tag, interpol) => {
    let message;

    let typeTranslations = this.TT[type];
    if (typeTranslations) {
      message = this.TT[type][tag];
    } else {
      message = tag;
    }
    if (!message) {
      message = tag;
    } else {
      message = message.replace('%v', interpol);
    }
    console.log(message, 'message returned');
    return message;
  };

  return factory = {
    translateMessage: (type, tag, interpol) => {
      return this.translateMessage(type, tag, interpol);
    },
    addForm: (form) => {
      if (!!form.setError && !!form.clearError) {
        this.registeredForms.push(form);
      } else {
        console.error(form);
        alert('form invalid', form);
      }
    },
    removeForm: (form) => {
      let index = this.registeredForms.findIndex(f => f === form);
      if (index => 0) {
        this.registeredForms.splice(index, 1);
      }
    },
    // returns object if error
    setFormError: (message, label, interpol) => {
      let form = this.registeredForms.find(form => form.field === label);
      if (form && label) {
        form.setError({
          message: this.translateMessage('error', message, interpol)
        });
      } else {
        return {
          msg: 'form_not_found'
        }
      }
    }, // returns object if error
    resetForm: (label) => {
      let form = this.registeredForms.find(form => form.field === label);
      if (form) {
        form.clearError();
      } else {
        return {
          msg: 'form_not_found'
        };
      }
    },
    resetAllForms: () => {
      this.registeredForms.forEach(form => {
        form.clearError();
      })
    }
  }
}]);