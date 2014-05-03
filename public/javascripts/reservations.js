jQuery(document).ready(function($) {
  $('#selector').datetimepicker({
    stepMinute: 5,
    timeFormat: 'hh:mm tt'
  });

  $('#reservationForm').on('submit', reserveDate);

});

function reserveDate(event) {
  event.preventDefault();
  
  var reservationDate = $('#selector').datetimepicker('getDate');

  var reservationData = {
    'reservationDate': reservationDate,
    'userId': 'chrisrodz'
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
      } else{
        console.log("Error: " + res.msg);
      };
    });
  };
}