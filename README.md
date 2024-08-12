[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ykat-UG-haftungsbeschrankt/petquery)](https://github.com/ykat-UG-haftungsbeschrankt/petquery)

<!--
[![GitHub](https://img.shields.io/github/license/jothepro/doxygen-awesome-css)](https://github.com/jothepro/doxygen-awesome-css/blob/main/LICENSE)
![GitHub Repo stars](https://img.shields.io/github/stars/jothepro/doxygen-awesome-css)
-->



Documentation
============

Once a pet is lost, most national authorities will only query national and local associations who register owner information about pets.

So petquery is a pretty simple plugin based meta query search engine for travelers.


🔗 <img src=https://github.com/favicon.ico width=16 height=16> [Repository](https://github.com/ykat-UG-haftungsbeschrankt/petquery)

Examples
------------

### http://127.0.0.1:50000 ###

If enabled in PetQueryConfig.route["/"] a small html page with search field to query all modules

### http://127.0.0.1:50000/json?query=112093400000465 ###

If enabled in PetQueryConfig.route.json to render results in existing websites

```JSON
{
   "error":[
      
   ],
   "data":[
      {
         "source":{
            "favicon":"https://animalid.by/favicon.ico",
            "url":"https://animalid.by",
            "name":"Animalid"
         },
         "data":{
            "Код микрочипа":"112093400000465",
            "Организация, проводившая чипирование":"Унитарное предприятие \"ВетМедиаСервис\"\t\t\t\t\t\t\r\n\t\t\t\t\t\tАдрес: Беларусь, Витебская, Витебск, ул. Чкалова, 68\t\t\t\t\t\t\r\n\t\t\t\t\t\tТелефоны:  +375-29-319-61-19, +375-33-319-61-19 \t\t\t\t\t\t\r\n\t\t\t\t\t\te-mail: trade@zooportal.by\t\t\t\t\t",
            "Ф.И.О. проводившего чипирование":"Базылевский Алексей Александрович",
            "Дата чипирования":"03.08.2015",
            "Вид животного":"Кот",
            "Кличка животного":"Моника",
            "Фото":"",
            "Порода":"Сиамская",
            "Окрас":"колор-пойнт",
            "Пол":"Самка",
            "Дата рождения":"30.12.1999",
            "Особые приметы":"-",
            "Владелец":"Обратитесь в организацию, проводившую чипирование"
         },
         "preview":"https://animalid.by/avatars/112093400000465_1492788685.jpg",
         "files":[
            "https://animalid.by/avatars/112093400000465_1492788685.jpg"
         ]
      }
   ]
}
```

### http://127.0.0.1:50000/api?query=112093400000465 ###

Only returns results from ./module/(PetQueryConfig.route.api.module)/index.js.

So if you are running petquery on your server and implemented a module to add your own data to the result set, the api can make this data available to other authorities by simply extending the petquery module and specify unique uri and authorization credentials in PetQueryConfig for the new module.

```C
[
      {
         "source":{
            "favicon":"https://animalid.by/favicon.ico",
            "url":"https://animalid.by",
            "name":"Animalid"
         },
         "data":{
            "Код микрочипа":"112093400000465",
            "Организация, проводившая чипирование":"Унитарное предприятие \"ВетМедиаСервис\"\t\t\t\t\t\t\r\n\t\t\t\t\t\tАдрес: Беларусь, Витебская, Витебск, ул. Чкалова, 68\t\t\t\t\t\t\r\n\t\t\t\t\t\tТелефоны:  +375-29-319-61-19, +375-33-319-61-19 \t\t\t\t\t\t\r\n\t\t\t\t\t\te-mail: trade@zooportal.by\t\t\t\t\t",
            "Ф.И.О. проводившего чипирование":"Базылевский Алексей Александрович",
            "Дата чипирования":"03.08.2015",
            "Вид животного":"Кот",
            "Кличка животного":"Моника",
            "Фото":"",
            "Порода":"Сиамская",
            "Окрас":"колор-пойнт",
            "Пол":"Самка",
            "Дата рождения":"30.12.1999",
            "Особые приметы":"-",
            "Владелец":"Обратитесь в организацию, проводившую чипирование"
         },
         "preview":"https://animalid.by/avatars/112093400000465_1492788685.jpg",
         "files":[
            "https://animalid.by/avatars/112093400000465_1492788685.jpg"
         ]
      }
   ]
```