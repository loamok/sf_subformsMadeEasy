LoamokSubFormsMadeEasyBundle
============================
Bundle for Symfony 2.

This Bundle allow you to manage multiple subforms with translations on the fields name the easy way.

Installation
------------

### Add it to your composer.json : 
```yaml
{
    "require": {
        ...,
        "loamok/subformsmadeeasy" : "dev-master"
    }
}
```

### Update your AppKernel.php :
```php
    public function registerBundles() {
        $bundles = array(
            ...,
            new Loamok\SubformsMadeEasyBundle\LoamokSubformsMadeEasyBundle(),
        );
```

Usage
-----
This bundle require Jquery 1.11.1 or compatible.

This bundle is usable with assetic.

Make sure you're correctly configure assetic to run in your bundle :

app/config/config.yml :
```yaml
# Assetic Configuration
assetic:
    bundles:
        ...
        - YourWonderfullBundle
```

Add Jquery to your layout.twig :
```html
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
```

Add the ressource to your layout.twig :
```html
    {% javascripts '@LoamokSubformsMadeEasyBundle/Resources/public/js/dynamicSubforms.js' %}
      <script type="text/javascript" src="{{ asset_url }}"></script>
    {% endjavascripts %}
```

Configure an Entity to use another entity in a multiple relation :
```php
<?php

namespace Your\WonderfullBundle\Entity;

use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;


/**
 * Article
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="ArticleRepository")
 * @ORM\HasLifecycleCallbacks
 */
class Article {

    /**
     * @var integer ... */
    private $id;

    /**
     * @var Collection
     *
     * @ORM\ManyToMany(targetEntity="Media", inversedBy="articles", cascade={"persist"})
     */
    private $medias;
```
Add subforms to the form associate : 
```php
<?php

namespace Your\WonderfullBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ArticleType extends AbstractType {

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options) {
        $builder
                ->add(...)
                ->add('medias', 'collection', array(
                    'type' => new MediaType(),
                    'allow_add' => true,
                    'allow_delete' => true
                ))
```
Add the row in your form.html.twig :
```html

<h3>{{ 'admin.article.form.title' | trans }}</h3>

<div class="well">
  {{ form_start(form, {'attr': {'class': 'form-horizontal'}}) }}
    ...
    <div class="form-group">
        {{ form_label(form.medias, 'article.form.medias'|trans, {'label_attr': {'class': 'col-sm-3 control-label'}}) }}
        {{ form_errors(form.medias) }}
        <div class="col-sm-4">
        {{ form_widget(form.medias, {'attr': {'class': 'form-control', 'style': 'height: auto;'}}) }}
        </div>
    </div>
```
In the same twig template but at the end of the file add the js configuration :
```html
<script type="text/javascript">

    function plop(e, i) {
        console.debug(e);
        console.debug(i);
        return true
    }


    $(document).ready(function () {
        new SubForm(
            new SubFormCfg(
                'your_wonderfullbundle_article_medias',
                "{{ 'article.form.mediaElement.label'|trans }}",
                "{{ 'article.form.deleteMediaBtn.label' | trans }}",
                "{{ 'article.form.addMediaBtn.label' | trans }}",
                [
                    new FieldDesc(
                        "{{ 'media.form.type'|trans }}",
                        'Type'
                    ),
                    new FieldDesc(
                        "{{ 'media.form.file'|trans }}",
                        'File'
                    )
                ],
                false,
            [
                new Closure(
                   'your_wonderfullbundle_article_medias',
                   'title',
                   'change',
                   'plop'
                )
            ]));
    });
</script>
```

Samples:
--------
> __Note__: Samples with a relation beetween post, tags, notes)

> __Note__: You can use translations for the labels by using 
 "{{ 'a.trans.key' | trans }}" in place of the label

> __Note__: The three following samples will do exactly the same result

Minimalistic config :
```html
<script type="text/javascript">
    
    function plop(e, i) {
        console.debug(e);
        console.debug(i);
        return true
    }

    $(document).ready(function () {
        new SubForm(
            {
                divName: 'my_wonderfullbundle_post_tag',
                elementLabel: "Tag",
                deleteBtnLabel: "Delete Tag",
                addBtnLabel: "New Tag",
                fields: [{fieldName: 'Name :', baseFieldName: 'Name'}],
                firstRequired: true,
                closures: [{
                   triggerName: 'my_wonderfullbundle_post_tag',
                   attachTo: 'title',
                   attachOn: 'change',
                   callableFn: 'plop'
                }]
            }
        );
    });
</script>
```
Short config :
```html
<script type="text/javascript">
    
    function plop(e, i) {
        console.debug(e);
        console.debug(i);
        return true
    }

    $(document).ready(function () {
        new SubForm(
            new SubFormCfg(
                'my_wonderfullbundle_post_tag',
                "Tag",
                "Delete Tag",
                "New Tag",
                [new FieldDesc('Name :', 'Name')],
                true,
                [ new Closure(
                   'my_wonderfullbundle_post_tag',
                   'title',
                   'change',
                   'plop'
                )]));
    });
</script>
```
Long config :
```html
<script type="text/javascript">

    function plop(e, i) {
        console.debug(e);
        console.debug(i);
        return true
    }

    $(document).ready(function () {
        var myfielddesc = new FieldDesc('Name :', 'Name');
        var mysubformcfg = new SubFormCfg(
                'my_wonderfullbundle_post_tag',
                "Tag",
                "Delete Tag",
                "New Tag",
                [myfielddesc],
                true,
                [ new Closure(
                   'my_wonderfullbundle_post_tag',
                   'title',
                   'change',
                   'plop'
                )]));
        var mysubform = new SubForm(mysubformcfg);
    });
</script>
```
Adding two subforms to a form :
```html
<script type="text/javascript">

    function plop(e, i) {
        console.debug(e);
        console.debug(i);
        return true
    }

    function noteValue(e, i) {
        console.debug(e);
        console.debug(i);
        return true
    }

    $(document).ready(function () {
        var myfielddesc = new FieldDesc('Name :', 'Name');
        var mysubformcfg = new SubFormCfg(
                'my_wonderfullbundle_post_tag',
                "Tag",
                "Delete Tag",
                "New Tag",
                [myfielddesc],
                true,
                [ new Closure(
                   'my_wonderfullbundle_post_tag',
                   'title',
                   'change',
                   'plop'
                )]));
        var mysubform = new SubForm(mysubformcfg);
    });
    new SubForm(
            {
                divName: 'my_wonderfullbundle_post_note',
                elementLabel: "Note",
                deleteBtnLabel: "Delete Note",
                addBtnLabel: "New Note",
                fields: [
                    {fieldName: 'Value :', baseFieldName: 'Value'},
                    {fieldName: 'User :', baseFieldName: 'User'}
                ],
                firstRequired: true,
                [ new Closure(
                   'my_wonderfullbundle_post_note',
                   'value',
                   'change',
                   'noteValue'
                )]));
            }
        );
</script>
```
License
-------

This bundle is under the GNU LESSER GENERAL PUBLIC LICENSE Version 3.

See the complete license in the bundle:

    LICENSE
