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
        modal:       true,
        title:       $( '#grid-prebuilt-dialog' ).attr( 'data-title' ),
        minWidth:    600,
        height: 350,
        create:      function(event, ui){
            $(this ).closest('.ui-dialog' ).find('.ui-dialog-buttonset button' ).eq(0 ).addClass('button-delete');
        },
        buttons : [
            {
                text : panels.i10n.buttons.cancel,
                click: function(){
                    $( '#grid-prebuilt-dialog' ).dialog('close');
                }
            },
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