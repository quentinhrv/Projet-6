const Sauce = require('../models/sauce');

const fs = require('fs');

// Fonction de création d'une sauce
exports.createSauce = (req, res, next) => {
    // Récupère l'objet sauce envoyé dans la requête et le convertit en objet JS
    const sauceObject = JSON.parse(req.body.sauce);
    // Supprime l'id généré automatiquement lors de la création de l'objet
    delete sauceObject._id;
    // Crée une nouvelle instance de l'objet Sauce en utilisant les propriétés de l'objet sauce envoyé dans la requête et les informations de l'image téléchargée
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    // Enregistre la nouvelle sauce dans la base de données
    sauce.save()
    .then(() => res.status(201).json({message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
};


exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      // Si il existe déjà une image
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body }; 
      // Si il n'existe pas d'image
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
  };
  


// Fonction de suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    // Cherche la sauce à supprimer dans la base de données par son ID
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        // Récupère le nom du fichier image de la sauce et le supprime de la base de données
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            // Supprime la sauce de la base de données
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
            .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
};


// Fonction de sélection d'une sauce en particulier
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};


// Fonction de sélection de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};


// Fonction de like et dislike d'une sauce
exports.likeDislike = (req, res, next) => {
    let like = req.body.like
    let userId = req.body.userId
    let sauceId = req.params.id
    if (like === 1) { // Si l'utilisateur aime la sauce
        // On met à jour la sauce en ajoutant l'utilisateur aux usersLiked et en augmentant le compteur de likes de 1
        Sauce.updateOne({_id: sauceId}, {$push: {usersLiked: userId}, $inc: {likes: +1}})
        .then(() => res.status(200).json({message: 'Like ajouté !'})) // On envoie une réponse 200 avec un message de confirmation
        .catch((error) => res.status(400).json({error})); // En cas d'erreur, on envoie une réponse 400 avec l'erreur correspondante
    };
    
    if (like === -1) { // Si l'utilisateur n'aime pas la sauce
        // On met à jour la sauce en ajoutant l'utilisateur aux usersDisliked et en augmentant le compteur de dislikes de 1
        Sauce.updateOne({_id: sauceId}, {$push: {usersDisliked: userId}, $inc: {dislikes: +1}})
        .then(() => {res.status(200).json({message: 'Dislike ajouté !'})}) // On envoie une réponse 200 avec un message de confirmation
        .catch((error) => res.status(400).json({error})); // En cas d'erreur, on envoie une réponse 400 avec l'erreur correspondante
    };
    
    if (like === 0) { // Si l'utilisateur annule son like/dislike
        Sauce.findOne({_id: sauceId})
        .then((sauce) => {
            if (sauce.usersLiked.includes(userId)) { // Si l'utilisateur avait précédemment aimé la sauce
                // On met à jour la sauce en retirant l'utilisateur des usersLiked et en diminuant le compteur de likes de 1
                Sauce.updateOne({_id: sauceId}, {$pull: {usersLiked: userId}, $inc: {likes: -1}})
                .then(() => res.status(200).json({message: 'Like retiré !'})) // On envoie une réponse 200 avec un message de confirmation
                .catch((error) => res.status(400).json({error})); // En cas d'erreur, on envoie une réponse 400 avec l'erreur correspondante
            };
            if (sauce.usersDisliked.includes(userId)) { // Si l'utilisateur avait précédemment disliké la sauce
                // On met à jour la sauce en retirant l'utilisateur des usersDisliked et en diminuant le compteur de dislikes de 1
                Sauce.updateOne({_id: sauceId}, {$pull: {usersDisliked: userId}, $inc: {dislikes: -1}})
                .then(() => res.status(200).json({message: 'Dislike retiré !'})) // On envoie une réponse 200 avec un message de confirmation
                .catch((error) => res.status(400).json({error})); // En cas d'erreur, on envoie une réponse 400 avec l'erreur correspondante
            };
        })
        .catch((error) => res.status(404).json({error}))
    };
};