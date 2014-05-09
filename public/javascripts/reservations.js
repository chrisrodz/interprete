jQuery(document).ready(function($) {
  $('#dateSelector').datepicker();

  $('#beginTimeSelector').timepicker({
    stepMinute: 5,
    timeFormat: 'hh:mm tt'
  });

  $('#endTimeSelector').timepicker({
    stepMinute: 5,
    timeFormat: 'hh:mm tt'
  });

});