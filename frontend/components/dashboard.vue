<template>
  <div class="row gap-20 masonry pos-r m-20">
    <div class="masonry-sizer col-md-6"></div>
    <div class="masonry-item w-100">
      <div class="row gap-20">
        <!-- #Toatl Visits ==================== -->
        <div class="col-md-3">
          <div class="layers bd bgc-white p-20">
            <div class="layer w-100 mB-10">
              <h6 class="lh-1">Total Visits</h6>
            </div>
            <div class="layer w-100">
              <div class="peers ai-sb fxw-nw">
                <div class="peer peer-greed">
                  <span id="sparklinedash"></span>
                </div>
                <div class="peer">
                  <span
                    class="d-ib lh-0 va-m fw-600 bdrs-10em pX-15 pY-15 bgc-green-50 c-green-500"
                  >+10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- #Total Page Views ==================== -->
        <div class="col-md-3">
          <div class="layers bd bgc-white p-20">
            <div class="layer w-100 mB-10">
              <h6 class="lh-1">Total Page Views</h6>
            </div>
            <div class="layer w-100">
              <div class="peers ai-sb fxw-nw">
                <div class="peer peer-greed">
                  <span id="sparklinedash2"></span>
                </div>
                <div class="peer">
                  <span class="d-ib lh-0 va-m fw-600 bdrs-10em pX-15 pY-15 bgc-red-50 c-red-500">-7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- #Unique Visitors ==================== -->
        <div class="col-md-3">
          <div class="layers bd bgc-white p-20">
            <div class="layer w-100 mB-10">
              <h6 class="lh-1">Unique Visitor</h6>
            </div>
            <div class="layer w-100">
              <div class="peers ai-sb fxw-nw">
                <div class="peer peer-greed">
                  <span id="sparklinedash3"></span>
                </div>
                <div class="peer">
                  <span
                    class="d-ib lh-0 va-m fw-600 bdrs-10em pX-15 pY-15 bgc-purple-50 c-purple-500"
                  >~12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- #Bounce Rate ==================== -->
        <div class="col-md-3">
          <div class="layers bd bgc-white p-20">
            <div class="layer w-100 mB-10">
              <h6 class="lh-1">Bounce Rate</h6>
            </div>
            <div class="layer w-100">
              <div class="peers ai-sb fxw-nw">
                <div class="peer peer-greed">
                  <span id="sparklinedash4"></span>
                </div>
                <div class="peer">
                  <span
                    class="d-ib lh-0 va-m fw-600 bdrs-10em pX-15 pY-15 bgc-blue-50 c-blue-500"
                  >33%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="masonry-item col-12">
      <!-- #Site Visits ==================== -->
      <div class="bd bgc-white">
        <div class="peers fxw-nw@lg+ ai-s">
          <div class="peer peer-greed w-70p@lg+ w-100@lg- p-20">
            <div class="layers">
              <div class="layer w-100 mB-10">
                <h6 class="lh-1">Site Visits</h6>
              </div>
              <div class="layer w-100">
                <div id="world-map-marker"></div>
              </div>
            </div>
          </div>
          <div class="peer bdL p-20 w-30p@lg+ w-100p@lg-">
            <div class="layers">
              <div class="layer w-100">
                <!-- Progress Bars -->
                <div class="layers">
                  <div class="layer w-100">
                    <h5 class="mB-5">100k</h5>
                    <small class="fw-600 c-grey-700">Visitors From USA</small>
                    <span class="pull-right c-grey-600 fsz-sm">50%</span>
                    <div class="progress mT-10">
                      <div
                        class="progress-bar bgc-deep-purple-500"
                        role="progressbar"
                        aria-valuenow="50"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width:50%;"
                      >
                        <span class="sr-only">50% Complete</span>
                      </div>
                    </div>
                  </div>
                  <div class="layer w-100 mT-15">
                    <h5 class="mB-5">1M</h5>
                    <small class="fw-600 c-grey-700">Visitors From Europe</small>
                    <span class="pull-right c-grey-600 fsz-sm">80%</span>
                    <div class="progress mT-10">
                      <div
                        class="progress-bar bgc-green-500"
                        role="progressbar"
                        aria-valuenow="50"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width:80%;"
                      >
                        <span class="sr-only">80% Complete</span>
                      </div>
                    </div>
                  </div>
                  <div class="layer w-100 mT-15">
                    <h5 class="mB-5">450k</h5>
                    <small class="fw-600 c-grey-700">Visitors From Australia</small>
                    <span class="pull-right c-grey-600 fsz-sm">40%</span>
                    <div class="progress mT-10">
                      <div
                        class="progress-bar bgc-light-blue-500"
                        role="progressbar"
                        aria-valuenow="50"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width:40%;"
                      >
                        <span class="sr-only">40% Complete</span>
                      </div>
                    </div>
                  </div>
                  <div class="layer w-100 mT-15">
                    <h5 class="mB-5">1B</h5>
                    <small class="fw-600 c-grey-700">Visitors From India</small>
                    <span class="pull-right c-grey-600 fsz-sm">90%</span>
                    <div class="progress mT-10">
                      <div
                        class="progress-bar bgc-blue-grey-500"
                        role="progressbar"
                        aria-valuenow="50"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width:90%;"
                      >
                        <span class="sr-only">90% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Pie Charts -->
                <div class="peers pT-20 mT-20 bdT fxw-nw@lg+ jc-sb ta-c gap-10">
                  <div class="peer">
                    <div
                      class="easy-pie-chart"
                      data-size="80"
                      data-percent="75"
                      data-bar-color="#f44336"
                    >
                      <span></span>
                    </div>
                    <h6 class="fsz-sm">New Users</h6>
                  </div>
                  <div class="peer">
                    <div
                      class="easy-pie-chart"
                      data-size="80"
                      data-percent="50"
                      data-bar-color="#2196f3"
                    >
                      <span></span>
                    </div>
                    <h6 class="fsz-sm">New Purchases</h6>
                  </div>
                  <div class="peer">
                    <div
                      class="easy-pie-chart"
                      data-size="80"
                      data-percent="90"
                      data-bar-color="#ff9800"
                    >
                      <span></span>
                    </div>
                    <h6 class="fsz-sm">Bounce Rate</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="masonry-item col-md-6">
      <!-- #Monthly Stats ==================== -->
      <div class="bd bgc-white">
        <div class="layers">
          <div class="layer w-100 pX-20 pT-20">
            <h6 class="lh-1">Monthly Stats</h6>
          </div>
          <div class="layer w-100 p-20">
            <canvas id="line-chart" height="220"></canvas>
          </div>
          <div class="layer bdT p-20 w-100">
            <div class="peers ai-c jc-c gapX-20">
              <div class="peer">
                <span class="fsz-def fw-600 mR-10 c-grey-800">
                  10%
                  <i class="fa fa-level-up c-green-500"></i>
                </span>
                <small class="c-grey-500 fw-600">APPL</small>
              </div>
              <div class="peer fw-600">
                <span class="fsz-def fw-600 mR-10 c-grey-800">
                  2%
                  <i class="fa fa-level-down c-red-500"></i>
                </span>
                <small class="c-grey-500 fw-600">Average</small>
              </div>
              <div class="peer fw-600">
                <span class="fsz-def fw-600 mR-10 c-grey-800">
                  15%
                  <i class="fa fa-level-up c-green-500"></i>
                </span>
                <small class="c-grey-500 fw-600">Sales</small>
              </div>
              <div class="peer fw-600">
                <span class="fsz-def fw-600 mR-10 c-grey-800">
                  8%
                  <i class="fa fa-level-down c-red-500"></i>
                </span>
                <small class="c-grey-500 fw-600">Profit</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="masonry-item col-md-6">
      <!-- #Todo ==================== -->
      <div class="bd bgc-white p-20">
        <div class="layers">
          <div class="layer w-100 mB-10">
            <h6 class="lh-1">Todo List</h6>
          </div>
          <div class="layer w-100">
            <ul class="list-task list-group" data-role="tasklist">
              <li class="list-group-item bdw-0" data-role="task">
                <div class="checkbox checkbox-circle checkbox-info peers ai-c">
                  <input type="checkbox" id="inputCall1" name="inputCheckboxesCall" class="peer">
                  <label for="inputCall1" class="peers peer-greed js-sb ai-c">
                    <span class="peer peer-greed">Call John for Dinner</span>
                  </label>
                </div>
              </li>
              <li class="list-group-item bdw-0" data-role="task">
                <div class="checkbox checkbox-circle checkbox-info peers ai-c">
                  <input type="checkbox" id="inputCall2" name="inputCheckboxesCall" class="peer">
                  <label for="inputCall2" class="peers peer-greed js-sb ai-c">
                    <span class="peer peer-greed">Book Boss Flight</span>
                    <span class="peer">
                      <span class="badge badge-pill fl-r badge-success lh-0 p-10">2 Days</span>
                    </span>
                  </label>
                </div>
              </li>
              <li class="list-group-item bdw-0" data-role="task">
                <div class="checkbox checkbox-circle checkbox-info peers ai-c">
                  <input type="checkbox" id="inputCall3" name="inputCheckboxesCall" class="peer">
                  <label for="inputCall3" class="peers peer-greed js-sb ai-c">
                    <span class="peer peer-greed">Hit the Gym</span>
                    <span class="peer">
                      <span class="badge badge-pill fl-r badge-danger lh-0 p-10">3 Minutes</span>
                    </span>
                  </label>
                </div>
              </li>
              <li class="list-group-item bdw-0" data-role="task">
                <div class="checkbox checkbox-circle checkbox-info peers ai-c">
                  <input type="checkbox" id="inputCall4" name="inputCheckboxesCall" class="peer">
                  <label for="inputCall4" class="peers peer-greed js-sb ai-c">
                    <span class="peer peer-greed">Give Purchase Report</span>
                    <span class="peer">
                      <span class="badge badge-pill fl-r badge-warning lh-0 p-10">not important</span>
                    </span>
                  </label>
                </div>
              </li>
              <li class="list-group-item bdw-0" data-role="task">
                <div class="checkbox checkbox-circle checkbox-info peers ai-c">
                  <input type="checkbox" id="inputCall5" name="inputCheckboxesCall" class="peer">
                  <label for="inputCall5" class="peers peer-greed js-sb ai-c">
                    <span class="peer peer-greed">Watch Game of Thrones Episode</span>
                    <span class="peer">
                      <span class="badge badge-pill fl-r badge-info lh-0 p-10">Tomorrow</span>
                    </span>
                  </label>
                </div>
              </li>
              <li class="list-group-item bdw-0" data-role="task">
                <div class="checkbox checkbox-circle checkbox-info peers ai-c">
                  <input type="checkbox" id="inputCall6" name="inputCheckboxesCall" class="peer">
                  <label for="inputCall6" class="peers peer-greed js-sb ai-c">
                    <span class="peer peer-greed">Give Purchase report</span>
                    <span class="peer">
                      <span class="badge badge-pill fl-r badge-success lh-0 p-10">Done</span>
                    </span>
                  </label>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="masonry-item col-md-6">
      <!-- #Sales Report ==================== -->
      <div class="bd bgc-white">
        <div class="layers">
          <div class="layer w-100 p-20">
            <h6 class="lh-1">Sales Report</h6>
          </div>
          <div class="layer w-100">
            <div class="bgc-light-blue-500 c-white p-20">
              <div class="peers ai-c jc-sb gap-40">
                <div class="peer peer-greed">
                  <h5>November 2017</h5>
                  <p class="mB-0">Sales Report</p>
                </div>
                <div class="peer">
                  <h3 class="text-right">$6,000</h3>
                </div>
              </div>
            </div>
            <div class="table-responsive p-20">
              <table class="table">
                <thead>
                  <tr>
                    <th class="bdwT-0">Name</th>
                    <th class="bdwT-0">Status</th>
                    <th class="bdwT-0">Date</th>
                    <th class="bdwT-0">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="fw-600">Item #1 Name</td>
                    <td>
                      <span class="badge bgc-red-50 c-red-700 p-10 lh-0 tt-c badge-pill">Unavailable</span>
                    </td>
                    <td>Nov 18</td>
                    <td>
                      <span class="text-success">$12</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-600">Item #2 Name</td>
                    <td>
                      <span
                        class="badge bgc-deep-purple-50 c-deep-purple-700 p-10 lh-0 tt-c badge-pill"
                      >New</span>
                    </td>
                    <td>Nov 19</td>
                    <td>
                      <span class="text-info">$34</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-600">Item #3 Name</td>
                    <td>
                      <span class="badge bgc-pink-50 c-pink-700 p-10 lh-0 tt-c badge-pill">New</span>
                    </td>
                    <td>Nov 20</td>
                    <td>
                      <span class="text-danger">-$45</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-600">Item #4 Name</td>
                    <td>
                      <span
                        class="badge bgc-green-50 c-green-700 p-10 lh-0 tt-c badge-pill"
                      >Unavailable</span>
                    </td>
                    <td>Nov 21</td>
                    <td>
                      <span class="text-success">$65</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-600">Item #5 Name</td>
                    <td>
                      <span class="badge bgc-red-50 c-red-700 p-10 lh-0 tt-c badge-pill">Used</span>
                    </td>
                    <td>Nov 22</td>
                    <td>
                      <span class="text-success">$78</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-600">Item #6 Name</td>
                    <td>
                      <span class="badge bgc-orange-50 c-orange-700 p-10 lh-0 tt-c badge-pill">Used</span>
                    </td>
                    <td>Nov 23</td>
                    <td>
                      <span class="text-danger">-$88</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-600">Item #7 Name</td>
                    <td>
                      <span class="badge bgc-yellow-50 c-yellow-700 p-10 lh-0 tt-c badge-pill">Old</span>
                    </td>
                    <td>Nov 22</td>
                    <td>
                      <span class="text-success">$56</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="ta-c bdT w-100 p-20">
          <a href="#">Check all the sales</a>
        </div>
      </div>
    </div>
    <div class="masonry-item col-md-6">
      <!-- #Weather ==================== -->
      <div class="bd bgc-white p-20">
        <div class="layers">
          <!-- Widget Title -->
          <div class="layer w-100 mB-20">
            <h6 class="lh-1">Weather</h6>
          </div>
          <!-- Today Weather -->
          <div class="layer w-100">
            <div class="peers ai-c jc-sb fxw-nw">
              <div class="peer peer-greed">
                <div class="layers">
                  <!-- Temprature -->
                  <div class="layer w-100">
                    <div class="peers fxw-nw ai-c">
                      <div class="peer mR-20">
                        <h3>
                          32
                          <sup>°F</sup>
                        </h3>
                      </div>
                      <div class="peer">
                        <canvas class="sleet" width="44" height="44"></canvas>
                      </div>
                    </div>
                  </div>
                  <!-- Condition -->
                  <div class="layer w-100">
                    <span class="fw-600 c-grey-600">Partly Clouds</span>
                  </div>
                </div>
              </div>
              <div class="peer">
                <div class="layers ai-fe">
                  <div class="layer">
                    <h5 class="mB-5">Monday</h5>
                  </div>
                  <div class="layer">
                    <span class="fw-600 c-grey-600">Nov, 01 2017</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Today Weather Extended -->
          <div class="layer w-100 mY-30">
            <div class="layers bdB">
              <div class="layer w-100 bdT pY-5">
                <div class="peers ai-c jc-sb fxw-nw">
                  <div class="peer">
                    <span>Wind</span>
                  </div>
                  <div class="peer ta-r">
                    <span class="fw-600 c-grey-800">10km/h</span>
                  </div>
                </div>
              </div>
              <div class="layer w-100 bdT pY-5">
                <div class="peers ai-c jc-sb fxw-nw">
                  <div class="peer">
                    <span>Sunrise</span>
                  </div>
                  <div class="peer ta-r">
                    <span class="fw-600 c-grey-800">05:00 AM</span>
                  </div>
                </div>
              </div>
              <div class="layer w-100 bdT pY-5">
                <div class="peers ai-c jc-sb fxw-nw">
                  <div class="peer">
                    <span>Pressure</span>
                  </div>
                  <div class="peer ta-r">
                    <span class="fw-600 c-grey-800">1B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Week Forecast -->
          <div class="layer w-100">
            <div class="peers peers-greed ai-fs ta-c">
              <div class="peer">
                <h6 class="mB-10">MON</h6>
                <canvas class="sleet" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  32
                  <sup>°F</sup>
                </span>
              </div>
              <div class="peer">
                <h6 class="mB-10">TUE</h6>
                <canvas class="clear-day" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  30
                  <sup>°F</sup>
                </span>
              </div>
              <div class="peer">
                <h6 class="mB-10">WED</h6>
                <canvas class="partly-cloudy-day" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  28
                  <sup>°F</sup>
                </span>
              </div>
              <div class="peer">
                <h6 class="mB-10">THR</h6>
                <canvas class="cloudy" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  32
                  <sup>°F</sup>
                </span>
              </div>
              <div class="peer">
                <h6 class="mB-10">FRI</h6>
                <canvas class="snow" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  24
                  <sup>°F</sup>
                </span>
              </div>
              <div class="peer">
                <h6 class="mB-10">SAT</h6>
                <canvas class="wind" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  28
                  <sup>°F</sup>
                </span>
              </div>
              <div class="peer">
                <h6 class="mB-10">SUN</h6>
                <canvas class="sleet" width="30" height="30"></canvas>
                <span class="d-b fw-600">
                  32
                  <sup>°F</sup>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="masonry-item col-md-6">
      <!-- #Chat ==================== -->
      <div class="bd bgc-white">
        <div class="layers">
          <div class="layer w-100 p-20">
            <h6 class="lh-1">Quick Chat</h6>
          </div>
          <div class="layer w-100">
            <!-- Chat Box -->
            <div class="bgc-grey-200 p-20 gapY-15">
              <!-- Chat Conversation -->
              <div class="peers fxw-nw">
                <div class="peer mR-20">
                  <img
                    class="w-2r bdrs-50p"
                    src="https://randomuser.me/api/portraits/men/11.jpg"
                    alt
                  >
                </div>
                <div class="peer peer-greed">
                  <div class="layers ai-fs gapY-5">
                    <div class="layer">
                      <div class="peers fxw-nw ai-c pY-3 pX-10 bgc-white bdrs-2 lh-3/2">
                        <div class="peer mR-10">
                          <small>10:00 AM</small>
                        </div>
                        <div class="peer-greed">
                          <span>Lorem Ipsum is simply dummy text of</span>
                        </div>
                      </div>
                    </div>
                    <div class="layer">
                      <div class="peers fxw-nw ai-c pY-3 pX-10 bgc-white bdrs-2 lh-3/2">
                        <div class="peer mR-10">
                          <small>10:00 AM</small>
                        </div>
                        <div class="peer-greed">
                          <span>the printing and typesetting industry.</span>
                        </div>
                      </div>
                    </div>
                    <div class="layer">
                      <div class="peers fxw-nw ai-c pY-3 pX-10 bgc-white bdrs-2 lh-3/2">
                        <div class="peer mR-10">
                          <small>10:00 AM</small>
                        </div>
                        <div class="peer-greed">
                          <span>Lorem Ipsum has been the industry's</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Chat Conversation -->
              <div class="peers fxw-nw ai-fe">
                <div class="peer ord-1 mL-20">
                  <img
                    class="w-2r bdrs-50p"
                    src="https://randomuser.me/api/portraits/men/12.jpg"
                    alt
                  >
                </div>
                <div class="peer peer-greed ord-0">
                  <div class="layers ai-fe gapY-10">
                    <div class="layer">
                      <div class="peers fxw-nw ai-c pY-3 pX-10 bgc-white bdrs-2 lh-3/2">
                        <div class="peer mL-10 ord-1">
                          <small>10:00 AM</small>
                        </div>
                        <div class="peer-greed ord-0">
                          <span>Heloo</span>
                        </div>
                      </div>
                    </div>
                    <div class="layer">
                      <div class="peers fxw-nw ai-c pY-3 pX-10 bgc-white bdrs-2 lh-3/2">
                        <div class="peer mL-10 ord-1">
                          <small>10:00 AM</small>
                        </div>
                        <div class="peer-greed ord-0">
                          <span>??</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Chat Send -->
            <div class="p-20 bdT bgc-white">
              <div class="pos-r">
                <input
                  type="text"
                  class="form-control bdrs-10em m-0"
                  placeholder="Say something..."
                >
                <button type="button" class="btn btn-primary bdrs-50p w-2r p-0 h-2r pos-a r-1 t-1">
                  <i class="fa fa-paper-plane-o"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap";

import { COLORS } from "./constants/colors";

import "jquery-sparkline";
import { debounce } from "lodash";
import Masonry from "masonry-layout";
import "jqvmap/dist/jquery.vmap.js";
import "jqvmap/dist/jqvmap.css";
import "jqvmap/dist/maps/jquery.vmap.world.js";
import "easy-pie-chart/dist/jquery.easypiechart.min.js";
import SkyconsInit from "skycons";
import Chart from "chart.js";

export default {
  data() {
    return {};
  },
  mounted: function() {
    if ($(".masonry", this.$el).length > 0) {
      new Masonry(".masonry", {
        itemSelector: ".masonry-item",
        columnWidth: ".masonry-sizer",
        percentPosition: true
      });
    }

    // ------------------------------------------------------
    // @Dashboard Sparklines
    // ------------------------------------------------------

    const drawSparklines = () => {
      if ($("#sparklinedash").length > 0) {
        $("#sparklinedash").sparkline([0, 5, 6, 10, 9, 12, 4, 9], {
          type: "bar",
          height: "20",
          barWidth: "3",
          resize: true,
          barSpacing: "3",
          barColor: "#4caf50"
        });
      }

      if ($("#sparklinedash2").length > 0) {
        $("#sparklinedash2").sparkline([0, 5, 6, 10, 9, 12, 4, 9], {
          type: "bar",
          height: "20",
          barWidth: "3",
          resize: true,
          barSpacing: "3",
          barColor: "#9675ce"
        });
      }

      if ($("#sparklinedash3").length > 0) {
        $("#sparklinedash3").sparkline([0, 5, 6, 10, 9, 12, 4, 9], {
          type: "bar",
          height: "20",
          barWidth: "3",
          resize: true,
          barSpacing: "3",
          barColor: "#03a9f3"
        });
      }

      if ($("#sparklinedash4").length > 0) {
        $("#sparklinedash4").sparkline([0, 5, 6, 10, 9, 12, 4, 9], {
          type: "bar",
          height: "20",
          barWidth: "3",
          resize: true,
          barSpacing: "3",
          barColor: "#f96262"
        });
      }
    };

    drawSparklines();

    // Redraw sparklines on resize
    $(window).resize(debounce(drawSparklines, 150));

    // ------------------------------------------------------
    // @Other Sparklines
    // ------------------------------------------------------

    $("#sparkline").sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
      type: "line",
      resize: true,
      height: "20"
    });

    $("#compositebar").sparkline("html", {
      type: "bar",
      resize: true,
      barColor: "#aaf",
      height: "20"
    });

    $("#compositebar").sparkline(
      [4, 1, 5, 7, 9, 9, 8, 7, 6, 6, 4, 7, 8, 4, 3, 2, 2, 5, 6, 7],
      {
        composite: true,
        fillColor: false,
        lineColor: "red",
        resize: true,
        height: "20"
      }
    );

    $("#normalline").sparkline("html", {
      fillColor: false,
      normalRangeMin: -1,
      resize: true,
      normalRangeMax: 8,
      height: "20"
    });

    $(".sparktristate").sparkline("html", {
      type: "tristate",
      resize: true,
      height: "20"
    });

    $(".sparktristatecols").sparkline("html", {
      type: "tristate",
      colorMap: {
        "-2": "#fa7",
        resize: true,
        "2": "#44f",
        height: "20"
      }
    });

    const values = [5, 4, 5, -2, 0, 3, -5, 6, 7, 9, 9, 5, -3, -2, 2, -4];
    const valuesAlt = [1, 1, 0, 1, -1, -1, 1, -1, 0, 0, 1, 1];

    $(".sparkline").sparkline(values, {
      type: "line",
      barWidth: 4,
      barSpacing: 5,
      fillColor: "",
      lineColor: COLORS["red-500"],
      lineWidth: 2,
      spotRadius: 3,
      spotColor: COLORS["red-500"],
      maxSpotColor: COLORS["red-500"],
      minSpotColor: COLORS["red-500"],
      highlightSpotColor: COLORS["red-500"],
      highlightLineColor: "",
      tooltipSuffix: " Bzzt",
      tooltipPrefix: "Hello ",
      width: 100,
      height: undefined,
      barColor: "9f0",
      negBarColor: "ff0",
      stackedBarColor: ["ff0", "9f0", "999", "f60"],
      sliceColors: ["ff0", "9f0", "000", "f60"],
      offset: "30",
      borderWidth: 1,
      borderColor: "000"
    });

    $(".sparkbar").sparkline(values, {
      type: "bar",
      barWidth: 4,
      barSpacing: 1,
      fillColor: "",
      lineColor: COLORS["deep-purple-500"],
      tooltipSuffix: "Celsius",
      width: 100,
      barColor: "39f",
      negBarColor: COLORS["deep-purple-500"],
      stackedBarColor: ["ff0", "9f0", "999", "f60"],
      sliceColors: ["ff0", "9f0", "000", "f60"],
      offset: "30",
      borderWidth: 1,
      borderColor: "000"
    });

    $(".sparktri").sparkline(valuesAlt, {
      type: "tristate",
      barWidth: 4,
      barSpacing: 1,
      fillColor: "",
      lineColor: COLORS["light-blue-500"],
      tooltipSuffix: "Celsius",
      width: 100,
      barColor: COLORS["light-blue-500"],
      posBarColor: COLORS["light-blue-500"],
      negBarColor: "f90",
      zeroBarColor: "000",
      stackedBarColor: ["ff0", "9f0", "999", "f60"],
      sliceColors: ["ff0", "9f0", "000", "f60"],
      offset: "30",
      borderWidth: 1,
      borderColor: "000"
    });

    $(".sparkdisc").sparkline(values, {
      type: "discrete",
      barWidth: 4,
      barSpacing: 5,
      fillColor: "",
      lineColor: "9f0",
      tooltipSuffix: "Celsius",
      width: 100,
      barColor: "9f0",

      negBarColor: "f90",

      stackedBarColor: ["ff0", "9f0", "999", "f60"],
      sliceColors: ["ff0", "9f0", "000", "f60"],
      offset: "30",
      borderWidth: 1,
      borderColor: "000"
    });

    $(".sparkbull").sparkline(values, {
      type: "bullet",
      barWidth: 4,
      barSpacing: 5,
      fillColor: "",
      lineColor: COLORS["amber-500"],
      tooltipSuffix: "Celsius",
      height: "auto",
      width: "auto",
      targetWidth: "auto",
      barColor: COLORS["amber-500"],
      negBarColor: "ff0",
      stackedBarColor: ["ff0", "9f0", "999", "f60"],
      sliceColors: ["ff0", "9f0", "000", "f60"],
      offset: "30",
      borderWidth: 1,
      borderColor: "000"
    });

    $(".sparkbox").sparkline(values, {
      type: "box",
      barWidth: 4,
      barSpacing: 5,
      fillColor: "",
      lineColor: "9f0",
      tooltipSuffix: "Celsius",
      width: 100,
      barColor: "9f0",
      negBarColor: "ff0",
      stackedBarColor: ["ff0", "9f0", "999", "f60"],
      sliceColors: ["ff0", "9f0", "000", "f60"],
      offset: "30",
      borderWidth: 1,
      borderColor: "000"
    });

    const vectorMapInit = () => {
      if ($("#world-map-marker").length > 0) {
        // This is a hack, as the .empty() did not do the work
        $("#vmap").remove();

        // we recreate (after removing it) the container div, to reset all the data of the map
        $("#world-map-marker").append(`<div 
          id="vmap" 
          style="height: 490px; position: relative; overflow: hidden; background-color: transparent;">
        </div>`);

        $("#vmap").vectorMap({
          map: "world_en",
          backgroundColor: "#a5bfdd",
          borderColor: "#818181",
          borderOpacity: 0.25,
          borderWidth: 1,
          color: "#f4f3f0",
          enableZoom: true,
          hoverColor: "#c9dfaf",
          hoverOpacity: null,
          normalizeFunction: "linear",
          scaleColors: ["#b6d6ff", "#005ace"],
          selectedColor: "#c9dfaf",
          selectedRegions: null,
          showTooltip: true,
          onRegionClick: function(element, code, region) {
            var message =
              'You clicked "' +
              region +
              '" which has the code: ' +
              code.toUpperCase();

            console.log(message);
          }
        });
      }
    };

    vectorMapInit();
    $(window).resize(debounce(vectorMapInit, 150));

    if ($(".easy-pie-chart").length > 0) {
      $(".easy-pie-chart").easyPieChart({
        onStep(from, to, percent) {
          this.el.children[0].innerHTML = `${Math.round(percent)} %`;
        }
      });
    }

    const Skycons = SkyconsInit(window);
    const icons = new Skycons({ color: "#ff6849" });
    const list = [
      "clear-day",
      "clear-night",
      "partly-cloudy-day",
      "partly-cloudy-night",
      "cloudy",
      "rain",
      "sleet",
      "snow",
      "wind",
      "fog"
    ];
    let i = list.length;

    while (i--) {
      const weatherType = list[i],
        elements = document.getElementsByClassName(weatherType);
      let j = elements.length;

      while (j--) {
        icons.set(elements[j], weatherType);
      }
    }

    icons.play();

    // ------------------------------------------------------
    // @Line Charts
    // ------------------------------------------------------

    const lineChartBox = document.getElementById("line-chart");

    if (lineChartBox) {
      const lineCtx = lineChartBox.getContext("2d");
      lineChartBox.height = 80;

      new Chart(lineCtx, {
        type: "line",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July"
          ],
          datasets: [
            {
              label: "Series A",
              backgroundColor: "rgba(237, 231, 246, 0.5)",
              borderColor: COLORS["deep-purple-500"],
              pointBackgroundColor: COLORS["deep-purple-700"],
              borderWidth: 2,
              data: [60, 50, 70, 60, 50, 70, 60]
            },
            {
              label: "Series B",
              backgroundColor: "rgba(232, 245, 233, 0.5)",
              borderColor: COLORS["blue-500"],
              pointBackgroundColor: COLORS["blue-700"],
              borderWidth: 2,
              data: [70, 75, 85, 70, 75, 85, 70]
            }
          ]
        },

        options: {
          legend: {
            display: false
          }
        }
      });
    }

    // ------------------------------------------------------
    // @Bar Charts
    // ------------------------------------------------------

    const barChartBox = document.getElementById("bar-chart");

    if (barChartBox) {
      const barCtx = barChartBox.getContext("2d");

      new Chart(barCtx, {
        type: "bar",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July"
          ],
          datasets: [
            {
              label: "Dataset 1",
              backgroundColor: COLORS["deep-purple-500"],
              borderColor: COLORS["deep-purple-800"],
              borderWidth: 1,
              data: [10, 50, 20, 40, 60, 30, 70]
            },
            {
              label: "Dataset 2",
              backgroundColor: COLORS["light-blue-500"],
              borderColor: COLORS["light-blue-800"],
              borderWidth: 1,
              data: [10, 50, 20, 40, 60, 30, 70]
            }
          ]
        },

        options: {
          responsive: true,
          legend: {
            position: "bottom"
          }
        }
      });
    }

    // ------------------------------------------------------
    // @Area Charts
    // ------------------------------------------------------

    const areaChartBox = document.getElementById("area-chart");

    if (areaChartBox) {
      const areaCtx = areaChartBox.getContext("2d");

      new Chart(areaCtx, {
        type: "line",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July"
          ],
          datasets: [
            {
              backgroundColor: "rgba(3, 169, 244, 0.5)",
              borderColor: COLORS["light-blue-800"],
              data: [10, 50, 20, 40, 60, 30, 70],
              label: "Dataset",
              fill: "start"
            }
          ]
        }
      });
    }

    // ------------------------------------------------------
    // @Scatter Charts
    // ------------------------------------------------------

    const scatterChartBox = document.getElementById("scatter-chart");

    if (scatterChartBox) {
      const scatterCtx = scatterChartBox.getContext("2d");

      Chart.Scatter(scatterCtx, {
        data: {
          datasets: [
            {
              label: "My First dataset",
              borderColor: COLORS["red-500"],
              backgroundColor: COLORS["red-500"],
              data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
                { x: 50, y: 60 },
                { x: 70, y: 80 },
                { x: 90, y: 100 },
                { x: 110, y: 120 },
                { x: 130, y: 140 }
              ]
            },
            {
              label: "My Second dataset",
              borderColor: COLORS["green-500"],
              backgroundColor: COLORS["green-500"],
              data: [
                { x: 150, y: 160 },
                { x: 170, y: 180 },
                { x: 190, y: 200 },
                { x: 210, y: 220 },
                { x: 230, y: 240 },
                { x: 250, y: 260 },
                { x: 270, y: 280 }
              ]
            }
          ]
        }
      });
    }
  },
  computed: {},
  components: {}
};
</script>

<style lang="scss" scoped>
</style>