const jwt = require('jsonwebtoken'); // Importation de la librairie jsonwebtoken


module.exports = (req, res, next) => { // Exportation de la fonction middleware
   try { 
       const token = req.headers.authorization.split(' ')[1]; // Récupération du token dans le header de la requête
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Vérification et décodage du token avec la clé secrète
       const userId = decodedToken.userId; // Récupération de l'identifiant utilisateur depuis le token décodé
       req.auth = { // Ajout de l'identifiant utilisateur à l'objet req
           userId: userId
       };
	next(); // Appel du prochain middleware
   } catch(error) {
       res.status(401).json({ error }); // En cas d'erreur, renvoi d'une réponse avec un code d'erreur 401
   }
};