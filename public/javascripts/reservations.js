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

  $('#reservationForm').on('submit', reserveDate);

  getReservations();

});

function reserveDate(event) {
  event.preventDefault();

  var reservationDate = $('#dateSelector').val();
  // TODO: Validate that end time is greater than begin time
  var reservationBeginTime = $('#beginTimeSelector').val();
  var reservationEndTime = $('#endTimeSelector').val();

  var confirmed = confirm('Save reservation for: ' + reservationDate
    + ' from: ' + reservationBeginTime + ' to: ' + reservationEndTime + '?');

  if (confirmed) {
    var reservationData = {
      'reservationDate': reservationDate,
      'beginTime': reservationBeginTime,
      'endTime': reservationEndTime
    }

    if (reservationDate !== null) {
      $.ajax({
        type: 'POST',
        url: '/reservations/add',
        data: reservationData,
        dataType: 'JSON'
      }).done(function(res) {
          console.log("Reservation success!");
          $('#availableHours').html(res.msg);
          console.log(res.msg);
          getReservations();
      });
    };
  };
}

function getReservations() {
  $('#userReservations ul').empty();
  $.ajax({
    type: 'GET',
    url: '/reservations/get',
  }).done(function(res) {
    $.each(res, function() {
      $('#userReservations ul').append("<li>" + this.reservationDate 
        + ". From: " + this.beginTime + " To: " + this.endTime + "</li>");
    });
  });
}