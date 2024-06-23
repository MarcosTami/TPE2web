"use strict";

//Constantes direcciones 
const API = 'https://666b32567013419182d29d94.mockapi.io';
const HOME = './content/home.html';
const cantProducs = 6;

//controla el menu desplegable
document.querySelector("#btn").addEventListener("click", toggle_menu);


// cierra el menu de opciones cuando se preciona una 
let options = document.querySelectorAll(".option").forEach(element => element.addEventListener("click", toggle_menu))


function toggle_menu(){
    let menu = document.querySelector("#menu");
    menu.classList.toggle("show");
}


// CARGA DEFAULT DE LA PAGINA
document.addEventListener("DOMContentLoaded", async (e)=> {
    e.preventDefault();
    let content = document.querySelector(".main");
    content.innerHTML = '<h2>Cargando...</h2>';
    try{
        let response = await fetch(HOME);
        if(response.ok){
            let text = await response.text();
            content.innerHTML = text;
            loadEventButtons();
            reloaded();
        }
        else{
            content.innerHTML =`<h2>Error ${response.status}</h2>`;
        }
    }catch(error){
        '<h2>Error al cargar!</h2>'
    }
});

//CARGA DINAMICA DE LA PAGINA 
async function rooter(e, path, isButtonClick) {
    let content = document.querySelector(".main");
    let creature = " ";
    if(isButtonClick){
        creature = e.target.getAttribute("data-creature");
    }
    else{
        creature = path;
    }
    

        content.innerHTML = '<h2>Cargando...</h2>';
    
        try{
            let response = await fetch(`./content/${creature}.html`);
            if(response.ok){
                let text = await response.text();
                content.innerHTML = text;
                if(creature==="contact"){
                    captcha();
                }
                else if(creature==="prices"){
                    await table();
                    
                    document.querySelector("#car-form").addEventListener("submit", add_car);
                    edit_btn();
                    add_car_btn();
                    delete_btn();
                    close_btn();
                }

                else if(creature === "categories"){
                    await loadCategoryContent(1);
                    eventProductCard();
                    butonAfterBefore();
                    totalPages();

                }

                loadEventButtons();
                window.scrollTo(0,0);
                if(isButtonClick && creature !== "product"){
                    window.history.pushState(creature, "Titulo", creature);
                }

            }
            else{
                content.innerHTML =`<h2>Error ${response.status}</h2>`;
            }
        }catch(error){
            content.innerHTML = '<h2>Error al cargar!</h2>' + error;
            console.error(error);
        }    
}

//BOTONES PARA NAVEGAR ENTRE PAGINAS

// Función que maneja el evento click en los botones .listen_button
function buttonClickListener(event) {
    let creature = event.target.getAttribute('data-creature');
    rooter(event, creature, true); // Indica que es un clic de botón
}

// Función para cargar o recargar los event listeners de los botones
function loadEventButtons() {
    let buttons = document.querySelectorAll(".listen_button");

    // Primero, eliminamos todos los event listeners existentes
    for (let button of buttons) {
        button.removeEventListener("click", buttonClickListener);
    }

    // Luego, agregamos los event listeners actualizados
    for (let button of buttons) {
        button.addEventListener("click", buttonClickListener);
    }
}

//CARGA TABLA

async function table(){
    try{
        
        let cars = document.querySelector("#cars-table");
        cars.innerHTML=" ";
        let table = await fetch(`${API}/cars`);
        let content = await table.json();
        for(let elem of content){
            cars.innerHTML += `
            <tr>
                <td>${elem.brand}</td>
                <td>${elem.model}</td>
                <td>${elem.year}</td>
                <td class="hidden_category">${elem.doors}</td>
                <td>${elem.power}</td>
                <td>$${elem.price}</td>
                <td id="${elem.id}"><input type="radio" name="car" class="radio"></td>
            </tr>`;
        }
    }catch(error){
        console.error(error);
    }
}


////FUNCIONES AUXILIARES ////

//Mensage para notificar que se debe selecionar un radioButton
function error_msg(flag){
    let msg = document.querySelector("#table-msg");
    if(!flag){
        msg.innerHTML = "Selecciona uno";
    }
    else{
        msg.innerHTML = " ";
    }
}
//Crea el objeto data para ser mandado a la DB 
function createDataForm(form){
    let formdata = new FormData(form);

    let data = {
        "brand": formdata.get("brand"),
        "model": formdata.get("model"),
        "year": formdata.get("year"),
        "doors": formdata.get("doors"),
        "power": formdata.get("power"),
        "price": formdata.get("price")
    }

    return data;
}

//Devuelve si el input del captcha tiene la clase correct, para avisar si fue rellenado correctamente 
function validForm() {
    let captchaInput = document.querySelector("#captcha");
    return captchaInput.classList.contains("correct");
}

//Cierra los formularios de la pagina de compra
function close_btn(){
    document.querySelector("#close_forms").addEventListener("click", ()=>{
        document.querySelectorAll(".table_form").forEach(element => element.classList.remove("show"))
        toggle_forms();
    });
}
//Cierra todo el apartado de edicion o creacion de autos en la pagina de compra

function toggle_forms(ContainerForm=undefined){
    if (ContainerForm!=undefined) {
        ContainerForm.classList.toggle("show");
    }
    document.querySelector(".overlay").classList.toggle("show");
    document.querySelector("#close_forms").classList.toggle("show");
}

////EDITAR AUTO////

//Encuantra la id del auto a editar en la tabla 
function edit_btn(){
    document.querySelector("#edit-car").addEventListener("click", async (e)=>{
        
        let containerForm  = document.querySelector(".container-car-edit-form");
        let radios = document.querySelectorAll(".radio");
        let flag = false;
        for(let selected of radios){
            if(selected.checked){
                toggle_forms(containerForm);

                let car_id = selected.parentElement.getAttribute("id");
                containerForm .setAttribute("data-id", car_id);
                document.querySelector("#edit-car-form").addEventListener("submit", edit_car);
                flag = true;
            }
                
        }
        
        error_msg(flag);
        
    });
        
}

//Muestra el formularion para editar un auto 
function edit_car(e){
    e.preventDefault();
    let form = document.querySelector("#edit-car-form");
    let data = createDataForm(form);
    try{
        edit_function(data);
        }catch(error){
            console.error(error);
        }
              
}

//Edita un auto 
async function edit_function(data){
    let containerForm  = document.querySelector(".container-car-edit-form");
    let form = document.querySelector("#edit-car-form");
    let car_id = containerForm .getAttribute("data-id");
        let element_edited = await fetch(`${API}/cars/${car_id}`,{
            "method":"PUT",
            "mode": 'cors',
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(data)
        });
        if(element_edited.ok){
            await table();
            form.reset();
            toggle_forms(containerForm )
        }
}

////AGREGAR UN AUTITO////

// Muestra el formulario para agregar un auto 
function add_car_btn(){
    document.querySelector("#add-car").addEventListener("click", async(e)=>{
        let containerForm  = document.querySelector(".container-car-add-form");
        toggle_forms(containerForm );
    });
}


// Agrega un auto a la DB (cars)
async function add_car(e){
    e.preventDefault();
    let containerForm  = document.querySelector(".container-car-add-form");
    let form = document.querySelector("#car-form");

    let data = createDataForm(form);
    try {
        let element_added = await fetch(`${API}/cars`,{
            "method":"POST",
            "headers": { "Content-type": "application/json" },
            "body": JSON.stringify(data)
        }
        );
        if(element_added.ok){
            await table();
            form.reset();
            toggle_forms(containerForm );
        }
    } catch (error) {
        console.log(error)
    }  
}


////ELIMINAR AUTITO////

//Encuentra la id del auto a eliminar en la tabla 

function delete_btn(){
    document.querySelector("#delete-car").addEventListener("click", async (e)=>{
        let flag = false;
        let radios = document.querySelectorAll(".radio");
        for(let selected of radios){
            if(selected.checked){
                let car_id = selected.parentElement.getAttribute("id");
                await delete_car(car_id);
                flag = true;
            }
        }
        error_msg(flag);
    });
}

// Elimina un auto de la DB 
async function delete_car(car_id){
    let element_deleted = await fetch(`${API}/cars/${car_id}`,{
        "method":"Delete"
    });

    if(element_deleted.ok){
        table();
    }
}

////CAPTCHA////


async function captcha(){
    
    let form = document.querySelector("#FORM");
    // Escucha si se envia el formulario de contacto
    form.addEventListener("submit", (e)=>{
        let message = document.querySelector("#message-sent");

        e.preventDefault();
        let formulary = new FormData(form);

        let UserName = formulary.get("name");
        if(validForm()){
            
            message.classList.toggle("verificated");

            let msg = document.querySelector("#message-text").innerHTML = ("El mensaje ha sido enviado, " + UserName);
            let timer = setTimeout(()=>{message.classList.toggle("verificated");}, 5000);
        }
    })
    //carga la imagen del captcha
        let key = Math.floor(Math.random()*3);
        let captchaTXT = ["15fhw2g5", "be1t5an0", "e43cv1l8"];
        
        document.querySelector('#img-captcha').src = ("./images/captcha/" + captchaTXT[key] + ".jpg");

        let input = document.querySelector("#captcha");

        // verifica si lo ingresa el usuario en el input del captcha es la clave del captcha  
        input.addEventListener("keyup", ()=>{
            let valid = document.querySelector("#valid");
            if(input.value == captchaTXT[key]){
                valid.innerHTML = "✔";
                input.classList.add("correct");
            }else{
                valid.innerHTML = "✘";
                input.classList.remove("correct");
            }
        });
    
}


////CATEGORIAS////

//Obtione informacion de la DB (products)
async function getProducts( id = -1, page = 1) {
    let cat;
    let content;
    if (id==-1) {

        let url = new URL(`${API}/products`);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', cantProducs)
        cat = await fetch(url, {
            method: 'GET',
            headers: {'content-type':'application/json'},
        });
        content = await cat.json();
    }else{
        cat = await fetch(`${API}/products/${id}`);
        content = await cat.json();
    }

    return await content
}

// Cambia la informacion de la pagina vehicles, por la informacion que el haya pedido el usuario 
async function product(id) {
    let product = await getProducts(id);
    document.querySelector("#car-img").src = `./images/vehicles/${await product.img}.jpg`;
    document.querySelector("#car-brand").innerHTML = await product.brand;
    document.querySelector("#car-model").innerHTML = await product.model;
    document.querySelector("#car-year").innerHTML = await product.year ; 
    document.querySelector("#car-door").innerHTML = await product.doors ; 
}

// Toma la infomacion de la DB y la cambierte en html para la pagina de categorias 
async function CreateCardsCategory(products) {

    let fragment="";

    for (const product of products) {
        fragment +=`
        <article class="card-option listen_button product_card" id="${product.id}" data-creature="product"><div>
            <article class="vehicle-image"><figure><img src="./images/vehicles/${product.img}.jpg" alt=""></figure></article>
            <section><h3 class="vehicle-text">${product.brand} ${product.model}</h3></section></div>
        </article>`;
    }

    return fragment;
}

// Toma la informacion de la Database tranformada en html y la inserta en la pagina vehicles 
async function insertCarCards(cards){
    let div = document.querySelector("#vehicles-results");
    div.innerHTML = '<h2>Cargando...</h2>';
    div.innerHTML = cards;
}

//Escucha los clicks en la pagina category y toma la id de la card que el usuario presiono 
function eventProductCard() {
   let productButtons = document.querySelectorAll(".product_card")
   for (const button of productButtons) {
    button.addEventListener("click", (e)=>{
        let id = e.target.getAttribute("id");
        product(id);
    })
   }
}


function butonAfterBefore() {
    document.querySelector(".previous").addEventListener("click",()=>{
        let page_number = document.querySelector(".page_number").value
        if (page_number> 1 ) {
            page_number--;
            loadCategoryContent(page_number);
            window.scrollTo(0,0);
        }
    } )

    document.querySelector(".next").addEventListener("click",()=>{
        let page_number = document.querySelector(".page_number").value;
        let totalPages = document.querySelector(".next").id;
        if (page_number < totalPages ) {
            page_number++;
            loadCategoryContent(page_number);
            window.scrollTo(0,0);
        }
    } )

}

async function loadCategoryContent (page_number) {

    let content = await getProducts(-1, page_number);
    let fragment = await CreateCardsCategory(content);
    await insertCarCards(fragment);

    let viewPage = document.querySelector(".page_number");
    viewPage.value = page_number;
    viewPage.innerHTML = page_number;
    loadEventButtons();
    eventProductCard();

}


async function totalPages() {
    let cat = await fetch(`${API}/products`);
    let content = await cat.json();
    let pages = Math.ceil((Object.keys(content).length)/cantProducs);
    document.querySelector(".next").id =`${pages}`;
}

//funciones para recargar contenido segun avance o retroceda el usuario
window.addEventListener("popstate",handlePageLoad);
    
window.addEventListener("load", handlePageLoad);

function handlePageLoad(e){
    let path = location.pathname.substring(1);
    if(path == '' || path == 'index.html'){
        path = 'home';
    }
    rooter(e, path, false);
}