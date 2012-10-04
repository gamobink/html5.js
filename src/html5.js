/**
 * Enables some HTML5 features in older browsers using jQuery & jQuery-UI 
 *
 * The purpose for this script is that you can write pure HTML5 without adding js-fallbacks every time you use new HTML5 features.
 * Just add the following lines in <head> and you are ready to go:
 * @example
 * <script type="text/javascript" src="/static/jquery/jquery.min.js"></script>
 * <script type="text/javascript" src="/static/jquery-ui/jquery-ui.min.js"></script>
 * <script type="text/javascript" src="/static/jquery-ui/jquery-ui-i18n.js"></script>
 * <link rel="stylesheet" type="text/css" href="/static/jquery-ui/css/jquery-ui.css" />
 * <!--[if lt IE 9]>
 * <script type="text/javascript" src="/static/html5shiv/html5shiv.js"></script>
 * <![endif]-->
 * <script type="text/javascript" src="/static/html5.js"></script>
 * <script type="text/javascript">
 * $(document).ready(function() {
 * 	html5js.init(document);
 * });
 * </script>
 * 
 * @author Tuomas Angervuori <tuomas.angervuori@gmail.com>
 * @requires http://jquery.com, http://jqueryui.com, https://github.com/aFarkas/html5shiv/
 * @status Support for new HTML5 features is still very limited. Also testing has been very limited (IE7+, Chrome, Opera, Firefox...)
 **/


var html5js = {
	
	defaultLang: 'en',
	
	/**
	 * Init jQuery fallbacks for all the HTML5 features that the browser doesn't support
	 **/
	init: function(scope) {
		
		var main = this;
		
		//HTML5 new form features
		$('form', scope).each(function() {
			
			var formElement = this;
			var testElement;
			//Autofocus
			if(!('autofocus' in document.createElement('input'))) {
				$('[autofocus]', formElement).each(function(index, input) {
					main.setFocus(input);
				});
			}
			
			//Placeholder
			if(!('placeholder' in document.createElement('input'))) {
				$('[placeholder]', formElement).each(function(index, input) {
					main.setPlaceholder(input, $(input).attr('placeholder'));
				});
			}
			
			//Required inputs
			if(!('required' in document.createElement('input'))) {
				$('[required]', formElement).each(function(index, input) {
					main.setRequired(input);
				});
			}
			
			//Date input
			testElement = document.createElement('input');
			testElement.setAttribute('type', 'date');
			if(testElement.type == 'text') {
				$('input[type=date]', formElement).each(function(index, input) {
					main.setDatepicker(input);
				});
			}
			
			//Range input
			testElement = document.createElement('input');
			testElement.setAttribute('type', 'range');
			if(testElement.type == 'text') {
				$('input[type=range]', formElement).each(function(index, input) {
					main.setRange(input);
				});
			}
		});
		
		//Hidden elements
		if(!('hidden' in document.createElement('span'))) {
			$('[hidden]', scope).each(function(index, input) {
				$(index).hide();
			});
		}
	},
	
	/**
	 * Add date picker into a input element
	 **/
	setDatepicker: function(input) {
		var lang = this.defaultLang;
		if(navigator.language) {
			lang = navigator.language;
		}
		else if(navigator.userLanguage) {
			lang = navigator.userLanguage;
		}
		var langParts = lang.split('-');
		if($.datepicker.regional[lang]) {
			$.datepicker.setDefaults($.datepicker.regional[lang]);
		}
		else if($.datepicker.regional[langParts[0]]) {
			$.datepicker.setDefaults($.datepicker.regional[langParts[0]]);
		}
		else {
			$.datepicker.setDefaults($.datepicker.regional['']);
		}
		$.datepicker.setDefaults({dateFormat: 'yy-mm-dd'}); //Date format sent should be always Y-m-d. Format visible to user could be according to locale...
		$(input).datepicker();
		///FIXME if the input value has been changed by some event, also the jQuery-UI datepicker should be updated
	},
	
	/**
	 * Set focus on input element
	 **/
	setFocus: function(input) {
		input.focus();
	},
	
	/**
	 * Add placeholder text into a input element
	 * 
	 * CSS: adds class html5jsPlaceholder for each element that has placeholder defined and class html5jsPlaceholderActive for elements that have placeholder visible
	 **/
	setPlaceholder: function(input, text) {
		
		var input = $(input);
		var className = 'html5jsPlaceholder';
		var activeClassName = 'html5jsPlaceholderActive';
		
		input.addClass(className);
		
		//Input element has no default value, activating placeholder
		if(input.val() == '') {
			input.data('placeholderActive', true);
			input.addClass(activeClassName);
			input.val(text);
		}
		//Input element has value, not activating the placeholder
		else {
			input.data('placeholderActive', false);
		}
		
		//Input element gets focus, clearing the placeholder
		input.focus(function() {
			if($(this).data('placeholderActive')) {
				$(this).val('');
				$(this).data('placeholderActive', false);
				$(this).removeClass(activeClassName);
			}
		});
		
		//Focus is lost from the input element
		input.blur(function() {
			//Input element value is empty, re-activating the placeholder
			if($(this).val() == '') {
				$(this).data('placeholderActive', true);
				$(this).addClass(activeClassName);
				$(this).val(text);
			}
			//Input element value is not empty
			else {
				$(this).data('placeholderActive', false);
			}
		});
		
		//Remove the placeholder text from input value when the form is submitted
		input.parents('form').submit(function() {
			if(input.data('placeholderActive')) {
				input.val('');
			}
		});
	},
	
	/**
	 * Set input element required
	 * 
	 * CSS: adds class html5jsRequired for required inputs and class html5jsMissingInput for required elements that don't contain value
	 **/
	setRequired: function(input) {
		
		var input = $(input);
		var className = 'html5jsRequired';
		var missingClassName = 'html5jsMissingInput';
		
		input.addClass(className);
		
		//Focus is lost, check if element has required value
		input.blur(function() {
			if((input.val() == '') || input.data('placeholderActive')) {
				input.addClass(missingClassName);
			}
			else {
				input.removeClass(missingClassName);
			}
		});
		
		//Form is submitted, prevent it if the element doesn't have a value
		input.parents('form').submit(function() {
			if(input.val() == '' || input.data('placeholderActive')) {
				input.addClass(missingClassName);
				return false;
			}
		});
	},
	
	/**
	 * Use jQuery slider in place of range input
	 * @link http://tjvantoll.com/2012/09/14/using-jquery-ui-slider-to-polyfill-html5-input-type-range/
	 */
	setRange: function(input) {
		input = $(input);
		
		var options = {
			min: parseInt(input.attr('min'), 10) || 0,
			max: parseInt(input.attr('max'), 10) || 100,
			value: parseInt(input.val(), 10) || 0,
			step: parseInt(input.attr('step'), 10) || 1,
			change: function(event, ui) {
				input.val(ui.value);
			}
		};
		if(input.attr('disabled')) {
			options.disabled = true;
		}
		
		var slider = $('<div />').slider(options);
		
		input.after(slider);
		input.hide();
	}
}
