/**
 * Handles pre-built Panel layouts.
 *
 * @copyright Greg Priday 2013
 * @license GPL 2.0 http://www.gnu.org/licenses/gpl-2.0.html
 */

jQuery(function($){
    $( '#grid-prebuilt-dialog' ).show().dialog( {
        dialogClass: 'panels-admin-dialog',
        autoOpen:    false,
        resizable:   false,
        draggable:   false,
        modal:       false,
        title:       $( '#grid-prebuilt-dialog' ).attr( 'data-title' ),
        minWidth:    600,
        height:      350,
        create:      function(event, ui){
        },
        open:        function(){
            var overlay = $('<div class="ui-widget-overlay ui-front"></div>').css('z-index', 1000);
            $(this).data('overlay', overlay).closest('.ui-dialog').before(overlay);
        },
        close :      function(){
            $(this).data('overlay').remove();
        },
        buttons : [
            {
                text: panels.i10n.buttons.insert,
                click: function(){
                    var $$ = $('#grid-prebuilt-input' );
                    if($$.val() == '') {
                        
                    }

                    var s = $$.find(':selected');
                    if(s.attr('data-layout-id') == null){
                        return;
                    }
                    
                    if(confirm(panels.i10n.messages.confirmLayout)){
                        // Clear the grids and load the prebuilt layout
                        panels.clearGrids();
                        panels.loadPanels(panelsPrebuiltLayouts[s.attr('data-layout-id')]);
                    }
                    $( '#grid-prebuilt-dialog' ).dialog('close');
                }
            }
        ]
        
    } );
    
    // Turn the dropdown into a chosen selector
    $( '#grid-prebuilt-dialog' ).find('select' ).chosen({
        search_contains: true,
        placeholder_text: $( '#grid-prebuilt-dialog' ).find('select' ).attr('placeholder') 
    });

    // Button for adding prebuilt layouts
    $( '#add-to-panels .prebuilt-set' )
        .button( {
            icons: {primary: 'ui-icon-prebuilt'},
            text:  false
        } )
        .click( function () {
            $( '#grid-prebuilt-dialog' ).dialog( 'open' );
            return false;
        } );
});