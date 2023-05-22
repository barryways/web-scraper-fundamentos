const PORT= 8000;
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cron = require('node-cron');
require('dotenv').config();
const app = express();

const url = 'https://www.prensalibre.com/economia/'

let noticiasHTML = '';

axios(url)//es una promesa
    .then( response =>{ //retorna una respuesta
        const html = response.data; //esa repuesta la pasamos a una constante que va a ser la data que devolvio la promesa
        const $ = cheerio.load(html); //ahora cada que llamemos al $ vamos a estar llamando a todo el html de la pagina
       
        const articles=[];
       
        $('.story-title',html ).each(function() {
            const title = $(this).text();
            const url = $(this).find('a').attr('href');
            articles.push({
                title,
                url
            })
        })
        noticiasLimpio = articles.map(articles => ({
            title: articles.title.trim().replace(/\n/g, ''),
            url: articles.url
          }));


          noticiasHTML = '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,700"><div style="text-align: center;"><h1 style="font-family: \'Roboto\', sans-serif;font-weight: 700;">Las noticias de esta semana son... </h1></div><div>     <div><ul style="  list-style: none;padding: 0;">'
          for (let i = 0; i < noticiasLimpio.length; i++) {
            const title = noticiasLimpio[i].title;
            const url = noticiasLimpio[i].url;
            
            noticiasHTML += `
            <li style="  background-color: #f2f2f2;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
            font-family: 'Roboto', sans-serif;
    font-weight: 400;"><a href="${url}" style="text-decoration: none; color: black;">${title}</a></li>
            `;
          }
          noticiasHTML +='</ul></div>'
          console.log(process.env.SENDGRID_API_KEY);
    }).catch(err =>console.log(err));






// Configura la API key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Reemplaza 'SENDGRID_API_KEY' con tu propia API key

// Función para enviar el correo electrónico
function sendEmail(noticiasHTML) {
  // Configura el objeto de correo electrónico
  const msg = {
    to: 'carlosdbc02@gmail.com', // Reemplaza con la dirección de correo del destinatario
    from: 'barryphotos7@gmail.com', // Reemplaza con la dirección de correo del remitente
    subject: 'Noticias semanales de Economia',
    html:`${noticiasHTML}`
  };

  // Envía el correo electrónico utilizando SendGrid
  sgMail.send(msg)
    .then(() => console.log('Correo enviado exitosamente'))
    .catch(error => console.error('Error al enviar el correo:', error));
}

// Configura el cron job para ejecutar la función sendEmail cada semana a las 9:00 AM (hora local)
cron.schedule('40 18 * * *', () => {
    console.log('hola');
    sendEmail(noticiasHTML);

  }, {
    timezone: 'America/Guatemala'
  });

app.listen(PORT, ()=>console.log(`el servidor esta corriendo en el puerto ${PORT}`));