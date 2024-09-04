//Nos aseguramos de que todos los elementos estén cargados en la página para javascript

document.addEventListener('DOMContentLoaded', function(){

    // window.onload = function(){
    //     alert('¡Acepta los cookies!')
    // }

    //Imprimimos por consola el ancho del navegador para las pruebas y controlar bien el responsive
    const anchoNavegador = window.innerWidth;
    console.log("Ancho del navegador:", anchoNavegador);


    //FUNCIÓN PARA MOSTRAR Y OCULTAR EL MENÚ PARA DISPOSITIVOS MÓVILES
    const buttonMenu = document.getElementById('button-menu');
    const contenido = document.getElementById('show-menu');

    buttonMenu.addEventListener('click', function() {
        if (contenido.style.display === 'none') {
            contenido.style.display = 'block'; 
            buttonMenu.textContent = "Ocultar menú";
        } else {
            contenido.style.display = 'none'; 
            buttonMenu.textContent = "Menú";
        }
    });


    /**¿POR QUÉ CREAMOS UNA FUNCIÓN PROPIA Y NO USAMOS EL TOOGLE,
     * Básicamente el objetivo no es solo ocultar y mostrar, sino cambiar 
     * dentro de la misma función la visualización y el style de varios elementos
     * de forma simultánea */

    const botonShow = document.getElementById("button-show");
    const mainSection = document.getElementById("section-1");
    botonShow.addEventListener('click', mostrar);
   
    function mostrar(){
        //detectamos el bloque donde esté el botón y lo guardamos en una variable local
        //¿Por qué this? Porque parte del elemento que haya activado la función (el botón)
        let padre = this.parentElement;
        //seleccionamos solo el hijo que tenga la id mostrar
        let hijo = padre.querySelector('#mostrar');
        //Al haber seleccionado varios elementos, ahora estamos obligados a iterar en un for each
        if (hijo.style.display === "inline-block"){
            padre.style.transition = "all 0.6s ease 0.1s";
            botonShow.style.transition = "transform 0.3s ease";
            console.log("ocultando bloque");
            hijo.style.display = 'none';
            mainSection.style.height = 'auto';
            mainSection.style.minHeight = '400px';
            padre.style.width = '0px';
            padre.style.height = '0px';
            botonShow.style.transform = "rotate(0deg)";
        } else {
            padre.style.transition = "all 0.3s ease 0.3s";
            botonShow.style.transition = "transform 0.6s ease ";
            console.log("Mostrando bloque");
            hijo.style.display = 'inline-block';
            mainSection.style.height = 'auto';
            mainSection.style.minHeight = '600px';
            padre.style.width = '350px';
            padre.style.height = '600px';
            botonShow.style.transform = "rotate(180deg)";
        }
    }


    /**
     * Vamos a generar un nuevo evento, que en este caso va a ser "scroll".
     * Si en algún momento se detecta el scroll en el documento, nuestro nav perderá opacidad.
     * Para perder opacidad mantendrá el mismo color pero disminuyendo su canal alpha en el rgba.
     *
     * Podemos conseguir que la opacidad vuelva al elemento con mouseenter, pero su contraparte, 
     * 'mouseleave' no será necesaria ya que el propio scroll devolverá la transparencia.
    */
    const nav = document.querySelector('nav')
    document.addEventListener('scroll', transparentar);
    nav.addEventListener('mouseenter', opacidad);

    function transparentar(){
        console.log("Estamos scrolleando");
        nav.style.backgroundColor = 'rgba(245, 245, 245, 0.8)';
    }

    function opacidad(){
        nav.style.backgroundColor = 'rgba(245, 245, 245, 1)';
    }
})
