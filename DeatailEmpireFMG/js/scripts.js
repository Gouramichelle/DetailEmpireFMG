/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

 const form = document.getElementById("contactForm");
  const successDiv = document.getElementById("successMessage");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;

    // Campos
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const message = document.getElementById("message");

    
    // Regex email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Resetear estados
    [name, email, phone, message].forEach((field) => {
      field.classList.remove("is-invalid");
    });
    successDiv.innerHTML = ""; // limpiar mensaje anterior

    // Validaciones
    if (name.value.trim() === "") {
      name.classList.add("is-invalid");
      isValid = false;
    }

    if (email.value.trim() === "" || !emailRegex.test(email.value.trim())) {
      email.classList.add("is-invalid");
      isValid = false;
    }

    if (phone.value.trim() === "") {
      phone.classList.add("is-invalid");
      isValid = false;
    }

    if (message.value.trim() === "") {
      message.classList.add("is-invalid");
      isValid = false;
    }

    // Si hay errores
    if (!isValid) {
      return;
    }
    
    // Si todo está correcto → mostrar mensaje de éxito
    successDiv.innerHTML = `
      <div class="alert alert-success" role="alert">
        ✅ Tu mensaje se envió correctamente.
      </div>
    `;

    // Limpiar formulario
    form.reset();
  });