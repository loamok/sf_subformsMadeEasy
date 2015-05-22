/* global $ */

//@ToDo update doc
/*
Utilisation (dans le template twig d'un formulaire):

<script type="text/javascript">
$(document).ready(function () {
    var mySubFormFieldDesc = new FieldDesc("{{ 'some.trans.key.fieldname'|trans }}", 'Fieldname');
    var mySubFormCfg = new SubFormCfg(
            'my_bestbundle_entity_subForm',
            "{{ 'some.trans.key.element.label'|trans }}",
            "{{ 'some.trans.key.deleteTagBtn.label' | trans }}",
            "{{ 'some.trans.key.addTagBtn.label' | trans }}",
            [mySubFormFieldDesc],
            false, ['voir closures']);
    var mySubForm = new SubForm(mySubFormCfg);
});
</script>

Où en une ligne :

<script type="text/javascript">
$(document).ready(function () {
new SubForm(
    new SubFormCfg(
        'my_bestbundle_entity_subForm',
        "{{ 'some.trans.key.element.label'|trans }}",
        "{{ 'some.trans.key.deleteTagBtn.label' | trans }}",
        "{{ 'some.trans.key.addTagBtn.label' | trans }}",
        [
            new FieldDesc(
                "{{ 'some.trans.key.fieldname'|trans }}",
                'Fieldname'
            ),
            new FieldDesc(
                "{{ 'other.trans.key.fieldname'|trans }}",
                'Fieldname'
            )
        ],
        false|true (depends de vos besoins)
        , ['voir closures']
    ));
});
</script>

Nouveautée : Ajouter des closures
Ceci vous permet de lier des fonctions propres à des évènements liès au champs du sous-formulaire

Vos fonctions doivent récupérer 2 paramètres :
 l'objet auquel est attaché le déclencheur
 l'index utilisé par le sous-formulaire

Créez une fonction avant l'appel à subform :

function plop(e, i) {
    console.debug(e);
    console.debug(i);
    return true
}

Dans votre appel à subFormCfg ajoutez votre closure :

....
            [mySubFormFieldDesc],
            false,
            [
                new Closure(
                   'my_bestbundle_entity_subForm',
                   'myElementName (eg type)',
                   'change' ou 'click' le déclencheur à utiliser,
                   'plop' le nom de votre fonction à appeler,
                   true || false : lancer le déclencheur au chargement de la page
                )
            ]);

*/

'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], function ($) {
        return factory($);
    });
  } else if(typeof exports !== 'undefined'){
    var _ = require('jquery');
    exports = module.exports = factory($);
  } else {
    // Browser globals
    factory($);
  }
}(this, function ($) {

    var _toArray = function(what /*, [sliceArgs] */){return Array.prototype.slice.call(arguments);}

    var DynamicSubforms = DynamicSubforms || {};

    DynamicSubforms.instanciate = function dynamicSubformsInstanciate(what, args){
        return this['DynamicSubforms'][what].apply(this, _toArray(arguments, 1));
    };

    DynamicSubforms.buildClosure = function buildClosure(){
        DynamicSubforms.instanciate('Closure', _toArray(arguments));
    };

    DynamicSubforms.buildFieldDesc = function buildFieldDesc(){
        DynamicSubforms.instanciate('FieldDesc', _toArray(arguments));
    };

    DynamicSubforms.buildSubFormCfg = function buildSubFormCfg(){
        DynamicSubforms.instanciate('SubFormCfg', _toArray(arguments));
    };

    DynamicSubforms.Closure = function Closure(triggerName, attachTo, attachOn, callableFn, runOnInit) {
        this.triggerName = triggerName;
        this.attachTo = attachTo;
        this.attachOn = attachOn;
        this.callableFn = callableFn;
        this.runOnInit = runOnInit;
    }

    DynamicSubforms.FieldDesc = function FieldDesc(fieldName, baseFieldName) {
        this.fieldName = fieldName;
        this.baseFieldName = baseFieldName;
    }

    DynamicSubforms.SubFormCfg = function SubFormCfg(divName, elementLabel, deleteBtnLabel, addBtnLabel, fields, firstRequired, closures) {
        this.divName = divName;
        this.elementLabel = elementLabel;
        this.deleteBtnLabel = deleteBtnLabel;
        this.addBtnLabel = addBtnLabel;
        this.fields = fields;
        this.firstRequired = firstRequired;
        this.closures = closures;
    }

    DynamicSubforms.SubForm = function SubFormConstructor(subFormCfg){
        return this.init(
            subFormCfg.divName,
            subFormCfg.elementLabel,
            subFormCfg.deleteBtnLabel,
            subFormCfg.addBtnLabel,
            subFormCfg.fields,
            subFormCfg.firstRequired,
            subFormCfg.closures
        );
    };

    DynamicSubforms.SubForm.prototype = {
        init: function subFormInit(containerId, elementLabel, deleteBtnLabel, addBtnLabel, fields, firstRequired, closures){
            this.container = $('div#'+containerId);
            this.elementLabel = elementLabel;
            this.deleteBtnLabel = deleteBtnLabel;
            this.addBtnLabel = addBtnLabel;
            this.fields = fields;
            this.firstRequired = firstRequired;
            this.closures = closures;

            this.addLink = $('<a href="#" id="add_btn-'+containerId+'" class="btn btn-default">'+this.addBtnLabel+'</a>');
            this.container.append(this.addLink);
            var obj = this;
            this.addLink.click(function(e){
                e.preventDefault();
                obj.addSubform();
                return false;
            });

            this.index = this.container.find(':input').length;

            var oldIndex = this.index;
            for (var ii=0; ii < this.closures.length; ii++) {
                $("[id^='"+this.closures[ii].triggerName+"_'][name*='"+this.closures[ii].attachTo+"']").each(function (i, e) {
                    obj.index = i;
                    obj.attachClosures();
                });
            }

            this.index = oldIndex;

            if(this.firstRequired) {
                this.addSubform();
            }

            if (this.index !=0) {
                this.container.children('div').each(function(){
                    obj.addDeleteLink(this.index);
                });
            }

            return this;
        },

        addSubform : function subFormAddSubform() {
    //        var iProtos = this.prototypes.length;
            var iProtos = this.index;
            // Dans le contenu de l'attribut « data-prototype », on remplace :
            // - le texte "__name__label__" qu'il contient par le label du champ
            // - le texte "__name__" qu'il contient par le numéro du champ
            this.prototypes[iProtos] = $(this.container.attr('data-prototype')
                    .replace(/__name__label__/g, this.elementLabel +' n°' + (this.index+1))
                    .replace(/__name__/g, this.index));
            for (field in this.fields) {
                $(this.prototypes[iProtos][0]).html($(this.prototypes[iProtos][0]).html()
                        .replace('>'+this.fields[field].baseFieldName+'</label>', '>'+this.fields[field].fieldName+'&nbsp;</label>'));
            }
            // On ajoute au prototype un lien pour pouvoir supprimer le subform
            this.addDeleteLink(iProtos);

            // On ajoute le prototype modifié à la fin de la balise <div>
            this.container.append(this.prototypes[iProtos]);

            this.attachClosures();
            // Enfin, on incrémente le compteur pour que le prochain ajout se fasse avec un autre numéro
            this.index++;
            return null;
        },

        addDeleteLink : function subFormAddDeleteLink(iProtos) {
            // Création du lien
            var deleteLink = $('<a href="#" class="btn btn-danger">'+this.deleteBtnLabel+'</a>');

            if(typeof this.prototypes[iProtos] != 'undefined') {
                // Ajout du lien
                this.prototypes[iProtos].append(deleteLink);
                var obj = this;
                // Ajout du listener sur le clic du lien
                deleteLink.click(function(e) {
                    e.preventDefault(); // évite qu'un # apparaisse dans l'URL
                    obj.prototypes[iProtos].remove();
                    return false;
                });
            }

            return null;
        },

        attachClosure : function subFormAttachClosure(closure) {
            var elem = $("#"+closure.triggerName+"_"+this.index+'_'+closure.attachTo);
            var index = this.index;
            switch (closure.attachOn) {
                case "click":
                    $(elem).click(function(){
                        return window[closure.callableFn]($(this), index);
                    });
                    if(closure.runOnInit) {
                        $(elem).click();
                    }
                    break;
                case "change":
                    $(elem).change(function(){
                        return window[closure.callableFn]($(this), index);
                    });
                    if(closure.runOnInit) {
                        $(elem).change();
                    }
                    break;
            }
            return null;
        },

        attachClosures : function subFormAttachClosures() {
            var i = 0, len = this.closures.length;
            for (i=0; i < len; i++) {
                this.attachClosure(this.closures[i]);
            }
            return null;
        }
    }

    return  DynamicSubforms;

}));
