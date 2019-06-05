<template>
  <div class="calendar-container container-fluid">
    <div class="row">
      <div class="col-md-8">
        <div id="full-calendar"></div>
      </div>
      <div class="col-md-4">
        <div class="bdrs-3 ov-h bgc-white bd">
          <div class="bgc-deep-purple-500 ta-c p-30">
            <h1 class="fw-300 mB-5 lh-1 c-white">
              01
              <span class="fsz-def">st</span>
            </h1>
            <h3 class="c-white">Monday</h3>
          </div>
          <div class="pos-r">
            <button
              type="button"
              class="mT-nv-50 pos-a r-10 t-2 btn cur-p bdrs-50p p-0 w-3r h-3r btn-warning"
            >
              <i class="fa fa-plus"></i>
            </button>
            <ul class="m-0 p-0 mT-20">
              <li class="bdB peers ai-c jc-sb fxw-nw">
                <a
                  class="td-n p-20 peers fxw-nw mR-20 peer-greed c-grey-900"
                  href="javascript:void(0);"
                  data-toggle="modal"
                  data-target="#calendar-edit"
                >
                  <div class="peer mR-15">
                    <i class="fa fa-fw fa-clock-o c-red-500"></i>
                  </div>
                  <div class="peer">
                    <span class="fw-600">All Day Event</span>
                    <div class="c-grey-600">
                      <span class="c-grey-700">Nov 01 -</span>
                      <i>Website Development</i>
                    </div>
                  </div>
                </a>
                <div class="peers mR-15">
                  <div class="peer">
                    <a href class="td-n c-deep-purple-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-pencil"></i>
                    </a>
                  </div>
                  <div class="peer">
                    <a href class="td-n c-red-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-trash-o"></i>
                    </a>
                  </div>
                </div>
              </li>
              <li class="bdB peers ai-c jc-sb fxw-nw">
                <a
                  class="td-n p-20 peers fxw-nw mR-20 peer-greed c-grey-900"
                  href="javascript:void(0);"
                  data-toggle="modal"
                  data-target="#calendar-edit"
                >
                  <div class="peer mR-15">
                    <i class="fa fa-fw fa-clock-o c-blue-500"></i>
                  </div>
                  <div class="peer">
                    <span class="fw-600">All Day Event</span>
                    <div class="c-grey-600">
                      <span class="c-grey-700">Nov 01 -</span>
                      <i>Website Development</i>
                    </div>
                  </div>
                </a>
                <div class="peers mR-15">
                  <div class="peer">
                    <a href class="td-n c-deep-purple-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-pencil"></i>
                    </a>
                  </div>
                  <div class="peer">
                    <a href class="td-n c-red-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-trash-o"></i>
                    </a>
                  </div>
                </div>
              </li>
              <li class="bdB peers ai-c jc-sb fxw-nw">
                <a
                  class="td-n p-20 peers fxw-nw mR-20 peer-greed c-grey-900"
                  href="javascript:void(0);"
                  data-toggle="modal"
                  data-target="#calendar-edit"
                >
                  <div class="peer mR-15">
                    <i class="fa fa-fw fa-clock-o c-indigo-500"></i>
                  </div>
                  <div class="peer">
                    <span class="fw-600">All Day Event</span>
                    <div class="c-grey-600">
                      <span class="c-grey-700">Nov 01 -</span>
                      <i>Website Development</i>
                    </div>
                  </div>
                </a>
                <div class="peers mR-15">
                  <div class="peer">
                    <a href class="td-n c-deep-purple-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-pencil"></i>
                    </a>
                  </div>
                  <div class="peer">
                    <a href class="td-n c-red-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-trash-o"></i>
                    </a>
                  </div>
                </div>
              </li>
              <li class="bdB peers ai-c jc-sb fxw-nw">
                <a
                  class="td-n p-20 peers fxw-nw mR-20 peer-greed c-grey-900"
                  href="javascript:void(0);"
                  data-toggle="modal"
                  data-target="#calendar-edit"
                >
                  <div class="peer mR-15">
                    <i class="fa fa-fw fa-clock-o c-green-500"></i>
                  </div>
                  <div class="peer">
                    <span class="fw-600">All Day Event</span>
                    <div class="c-grey-600">
                      <span class="c-grey-700">Nov 01 -</span>
                      <i>Website Development</i>
                    </div>
                  </div>
                </a>
                <div class="peers mR-15">
                  <div class="peer">
                    <a href class="td-n c-deep-purple-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-pencil"></i>
                    </a>
                  </div>
                  <div class="peer">
                    <a href class="td-n c-red-500 cH-blue-500 fsz-md p-5">
                      <i class="fa fa-trash-o"></i>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="calendar-edit">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="bd p-15">
            <h5 class="m-0">Add Event</h5>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label class="fw-500">Event title</label>
                <input class="form-control bdc-grey-200">
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label class="fw-500">Start</label>
                  <div class="timepicker-input input-icon form-group">
                    <div class="input-group">
                      <div class="input-group-addon bgc-white bd bdwR-0">
                        <i class="fa fa-calendar"></i>
                      </div>
                      <input
                        type="text"
                        class="form-control bdc-grey-200 start-date"
                        placeholder="Datepicker"
                        data-provide="datepicker"
                      >
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="fw-500">End</label>
                  <div class="timepicker-input input-icon form-group">
                    <div class="input-group">
                      <div class="input-group-addon bgc-white bd bdwR-0">
                        <i class="fa fa-calendar"></i>
                      </div>
                      <input
                        type="text"
                        class="form-control bdc-grey-200 end-date"
                        placeholder="Datepicker"
                        data-provide="datepicker"
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="fw-500">Event title</label>
                <textarea class="form-control bdc-grey-200" rows="5"></textarea>
              </div>
              <div class="text-right">
                <button class="btn btn-primary cur-p" data-dismiss="modal">Done</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as $ from 'jquery';
import 'bootstrap';
import _ from 'lodash';

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import 'fullcalendar/dist/fullcalendar.js';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  data() {
    return {};
  },
  mounted: function(){
    const date = new Date();
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();

    const events = [{
      title: 'All Day Event',
      start: new Date(y, m, 1),
      desc: 'Meetings',
      bullet: 'success',
    }, {
      title: 'Long Event',
      start: new Date(y, m, d - 5),
      end: new Date(y, m, d - 2),
      desc: 'Hangouts',
      bullet: 'success',
    }, {
      title: 'Repeating Event',
      start: new Date(y, m, d - 3, 16, 0),
      allDay: false,
      desc: 'Product Checkup',
      bullet: 'warning',
    }, {
      title: 'Repeating Event',
      start: new Date(y, m, d + 4, 16, 0),
      allDay: false,
      desc: 'Conference',
      bullet: 'danger',
    }, {
      title: 'Birthday Party',
      start: new Date(y, m, d + 1, 19, 0),
      end: new Date(y, m, d + 1, 22, 30),
      allDay: false,
      desc: 'Gathering',
    }, {
      title: 'Click for Google',
      start: new Date(y, m, 28),
      end: new Date(y, m, 29),
      url: 'http ://google.com/',
      desc: 'Google',
      bullet: 'success',
    }];

    $('#full-calendar', this.$el).fullCalendar({
      events,
      height: 800,
      editable: true,
      header: {
        left: 'month,agendaWeek,agendaDay',
        center: 'title',
        right: 'today prev,next',
      },
    });
  },
  computed: {},
  components: {}
};
</script>

<style lang="scss" scoped>
.calendar-container{
  padding: 30px;
}
</style>