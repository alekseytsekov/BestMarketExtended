
let loader = {};

window.addEventListener('load', function(){
    loader.start = function(){
        $('#loader').show();
    }

    loader.stop = function(){
        $('#loader').hide();
    }
})