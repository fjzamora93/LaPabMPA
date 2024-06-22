const fs = require('fs');
const recipes = require('../data/recipes.json');
const path = require('path');

const rutaRecetas = path.join(
    path.dirname(require.main.filename),
    'data',
    'recipes.json'
);

const getRecipesFromFile = callback => {
    fs.readFile(rutaRecetas, (err, data) => {
        if (err){
            console.log('error')
            callback([]);
        } else {
            const contenido = JSON.parse(data)
            callback(contenido);
        };
    });
};

module.exports = class Recipe{
    constructor(id, nombre, image, descripcion, ingredientes){
        this.id = id;
        this.nombre = nombre;
        this.image = image;
        this.descripcion = descripcion;
        this.ingredientes = ingredientes;
    }

    addRecipe(){
        getRecipesFromFile(recetas => {
            recetas.push(this);
            // Los parámetros adicionales de stringfy es para que me mantenga un  formato rico
            fs.writeFile(rutaRecetas, JSON.stringify(recetas, null, 2), err => { 
                console.log(err)
            });
        });
    }


    //TODO: FUNCIONES PENDIENTES DE IMPLEMENTAR. ¿USAR BOTONES?
    editRecipe(){
        getRecipesFromFile(recetas => {
            let indice = recetas.findIndex(rect => rect.id === this.id);
            if (indice !== -1) {
                recetas[indice] = this;
                console.log(recetas[indice])
                fs.writeFile(rutaRecetas, JSON.stringify(recetas, null, 2), err => { 
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('File written successfully');
                    }
                });
            } else {
                console.log(`Objeto con id ${this.id} no encontrado en la lista.`);
            }
        })
    }

    deleteRecipe(id, callback){
        console.log(this);
    }

    

    static findOne(id, callback){
        console.log("Id encontrada: ", id);
        getRecipesFromFile(recetas => {
            const receta = recetas.find(rec => rec.id === id);
            callback(receta)
        });
    };


    static findAll(callback){
        getRecipesFromFile(callback);
    }
    

}

