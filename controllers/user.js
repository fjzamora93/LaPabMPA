const RecetaMdb = require('../models/recipeMdb'); 
const User = require('../models/user');
const { ObjectId } = require('mongodb');
const ITEMS_PER_PAGE = 15;


exports.getIndex = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const usuario = req.user || null;

        if (req.user){
            console.log("USUARIO: ", req.user.name);
        } else {
            console.log("NO HAY USUARIO");
        }
        
        const totalItems = await RecetaMdb.find().countDocuments();
        const products = await RecetaMdb.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sort({ nombre: 1 });

        res.render('index', {
            csrfToken: req.csrfToken(),
            usuario: req.user,
            recetas: products,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.getSearch = async (req, res, next) => {
    try {
        const { search, categoria } = req.query;
        const page = +req.query.page || 1;
        const usuario = req.user || null;
        let filter = {};
        if (categoria && categoria !== "todas") {
            filter.categoria = categoria;
        }
        if (search) {
            filter.nombre = { $regex: search, $options: 'i' };
        }
        console.log('Valor del filtro: ', filter);

        const totalItems = await RecetaMdb.find(filter).countDocuments();
        const items = await RecetaMdb.find(filter)
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('index', {
            categoria: categoria,
            search: search,
            usuario: usuario,
            recetas: items,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};




exports.getRecipeDetails = async (req, res, next) => {
    const recetaId = req.params.recetaId;
    const receta = await RecetaMdb.findById(recetaId);

    //! POTENCIAL ERROR EN CASO DE QUE NO HAYA CREATOR
    let creator = await User.findById(receta.creator);
    if (!creator) {
        // Si no se encuentra el creator, establecer un ID predeterminado
        receta.creator = new ObjectId("66a2745270aea4d3ed7fa2d5");
        await receta.save();
        creator = await User.findById(receta.creator);
      }

    //Verificamos si el que visita esta vista es el autor
    let isCreator = false; 
    if (req.user){
        isCreator = req.user._id.toString() === receta.creator.toString() ? true : false;
    } 

    //Buscamos recetas similares
    recetasSimilares = await obtenerSimilarRecipes(recetaId);
    descripcionFormateada = receta.descripcion.split("\n");


    try {
        res.render('recipe-details',{
            receta : receta,
            descripcionFormateada: descripcionFormateada,
            isCreator : isCreator,
            creator: creator,
            recetasSimilares: recetasSimilares,
        })
    } catch (error) {   
        res.status(500).render('500', {

    });
    }
};


async function obtenerSimilarRecipes(recetaId) {
    const receta = await RecetaMdb.findById(recetaId);
    const arrayTitulo = receta.nombre.split(" ");
    const tituloLimpio = arrayTitulo.filter(palabra => palabra.length > 3);
    let recetasSimilares = [];
    for (let palabra of tituloLimpio) {
        recetasMongoose = await RecetaMdb.find({
            nombre: { $regex: palabra, $options: 'i' }
        });
        recetasSimilares.push(...recetasMongoose);
    }

    recetasSimilares = recetasSimilares.filter(receta => receta._id.toString() !== recetaId.toString());
    recetasSimilares = [...new Set(recetasSimilares)];
    
    return recetasSimilares;
}


exports.getBookmark = (req, res, next) => {
    const bookmarkIds = req.user.bookmark;
    RecetaMdb.find({ _id: { $in: bookmarkIds } })
        .then(recetas => {
            res.render('user/bookmark', {
                user: req.user,
                recetas: recetas
            });
        })
        .catch(err => console.log(err));
}

exports.postSaveBookmark = (req, res, next) =>{

    idReceta = req.body.idReceta; //tenemos que buscar la ID
    RecetaMdb.findById(idReceta)
        .then(receta => {
            return req.user.addBookmark(receta)
        })
        .then( result => {
            console.log(req.user, idReceta)
            res.redirect('/bookmark')
        })
}


exports.postDeleteBookmark = async (req, res, next) => {
    const recetaId = req.body.idReceta;
    try {
        const user = await User.findById(req.user._id);
        const listaAux = await user.bookmark.filter(id => id.toString() !== recetaId.toString());
        user.bookmark = listaAux;
        await user.save();
        res.redirect('/bookmark');
    }
    catch (err) {
        console.log(err);
    }
}