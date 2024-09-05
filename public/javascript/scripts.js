


function addClick(button, name) {
    const parentDiv = button.parentNode;
    const nuevoInput = document.createElement('input');
    const deleteButton = document.createElement('button');
    const addButton = document.createElement('button');

    // Set up the new input field
    nuevoInput.type = 'text';
    nuevoInput.name = `${name}[]`;
    nuevoInput.required = true;
    nuevoInput.className = 'input-list';

   
    // Set up the delete button
    deleteButton.innerText = '-';
    deleteButton.className = 'button-delete';
    deleteButton.onclick = function() {
        // Remove the input field and the delete button
        parentDiv.removeChild(nuevoInput);
        parentDiv.removeChild(deleteButton);
        parentDiv.removeChild(addButton);
    };


    // Add the new input field and the buttons to the div
    parentDiv.appendChild(nuevoInput);
    parentDiv.appendChild(deleteButton);

}

function removeClick(button) {
    const parentDiv = button.parentNode;
    const inputEliminar = button.previousElementSibling;
    parentDiv.removeChild(inputEliminar);
    parentDiv.removeChild(button);
}