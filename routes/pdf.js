const express = require('express');
const router = express.Router();

const PDFDocument = require('pdfkit');
const path = require('path');

//TODO AQUÍ ESTÁ MEZCLADO EL CONTROLLER CON EL ROUTER

router.get('/generate-pdf/:recipeId', (req, res, next) => {
    const recipeId = req.params.recipeId;
  
    Recipe.findById(recipeId)
      .then(receta => {
        if (!receta) {
          return res.status(404).send('Recipe not found');
        }
  
        const doc = new PDFDocument();
  
        // Configura la cabecera de respuesta para descargar el PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${receta.nombre}.pdf`);
  
        // Envía el PDF como respuesta
        doc.pipe(res);
  
        // Agrega contenido al PDF
        doc.fontSize(25).text(receta.nombre, {
          align: 'center'
        });
  
        doc.moveDown();
        doc.fontSize(18).text('Descripción:');
        doc.fontSize(14).text(receta.descripcion);
  
        doc.moveDown();
        doc.fontSize(18).text('Ingredientes:');
        receta.ingredientes.forEach(ingrediente => {
          doc.fontSize(14).text(`- ${ingrediente}`);
        });
  
        doc.moveDown();
        doc.fontSize(18).text('Instrucciones:');
        receta.instrucciones.forEach((instruccion, index) => {
          doc.fontSize(14).text(`${index + 1}. ${instruccion}`);
        });
  
        doc.moveDown();
        doc.fontSize(18).text('Tiempo de elaboración:');
        doc.fontSize(14).text(receta.tiempo);
  
        doc.moveDown();

        //Agrega la imagen al PDF al final para que no se superponga
        const imagePath = path.join(__dirname, '..', receta.image);
        doc.image(imagePath, {
            fit: [500, 400],
            align: 'center',
            valign: 'center'
        });
  
        // Finaliza el documento
        doc.end();
      })
      .catch(err => next(err));
  });
  
  module.exports = router;