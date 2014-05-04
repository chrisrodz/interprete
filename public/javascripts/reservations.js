jQuery(document).ready(function($) {
  $('#dateSelector').datepicker();

  $('#beginTimeSelector').timepicker({
    stepMinute: 30,
    timeFormat: 'hh:mm tt'
  });

  $('#endTimeSelector').timepicker({
    stepMinute: 30,
    timeFormat: 'hh:mm tt'
  });

  $('#reservationForm').on('submit', reserveDate);

  getReservations(localStorage.userId);

});

function reserveDate(event) {
  event.preventDefault();
  
  var reservationDate = $('#dateSelector').val();
  // TODO: Validate that end time is greater than begin time
  var reservationBeginTime = $('#beginTimeSelector').val();
  var reservationEndTime = $('#endTimeSelector').val();

  var reservationData = {
    'reservationDate': reservationDate,
    'beginTime': reservationBeginTime,
    'endTime': reservationEndTime,
    'userId': localStorage.userId
  }

  if (reservationDate !== null) {
    $.ajax({
      type: 'POST',
      url: '/reservations/add',
      data: reservationData,
      dataType: 'JSON'
    }).done(function(res) {
      if (res.msg === '') {
        console.log("Reservation success!");
        getReservations(localStorage.userId);
      } else{
        console.log("Error: " + res.msg);
      };
    });
  };
}

function getReservations(id) {
  $('#userReservations ul').empty();
  $.ajax({
    type: 'GET',
    url: '/reservations/get/' + id,
  }).done(function(res) {
    $.each(res, function() {
      $('#userReservations ul').append("<li>" + this.reservationDate 
        + ". From: " + this.beginTime + " To: " + this.endTime + "</li>");
    });
  });
}