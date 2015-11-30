/* global define, app, Backbone, _ */
define([
    'app/config',

    'components/map/controller/mapController',
    'components/report/views/resultsView',
    'components/report/controller/reportController',
    'components/query/controller/queryController',

    'components/report/model/reportModel',

    'esri/layers/ArcGISImageServiceLayer',
    'esri/map',

    'dojo/text!../templates/reportTemplate.html'
  ],

  function(
    config,

    mapController, Results, reportController, queryController,

    ReportModel,

    ImageLayer, Map,

    reportTemplate

  ) {
    var report = Backbone.View.extend({

      events: {
        'click .editTitle': 'editTitle',
        'click .closeSplash': 'hideEditTitleModal',
        'change #siteTitle': 'setSiteTitle',
        'click .saveEditModal': 'saveSolarCalculatorValues',
        'click .saveSiteDetailsModal': 'saveSiteDetails',
        'click .restoreDefaultsButton': 'resetDefaultSolarCalculatorValues'
      },

      initialize: function() {
        // this.model = new ReportModel();
        // app.reportModel = this.model;
        this.listenTo(app.reportModel, 'change', this.render);
        this.render();
      },

      render: function() {
        queryController.calculateSystemData();

        var template = _.template(reportTemplate);

        var options = {
          siteTitle: app.reportModel.attributes.siteTitle,
          siteName: app.reportModel.attributes.siteName,
          siteNotes: app.reportModel.attributes.siteNotes,
          lat: app.reportModel.attributes.latLngPt.y,
          lng: app.reportModel.attributes.latLngPt.x,
          averagePerDay: app.reportModel.get('averagePerDay'),
          averagePerMonth: app.reportModel.get('averagePerMonth'),
          averageUsePerMonth: app.reportModel.get('averageUsePerMonth'),
          costPerkWh: app.reportModel.get('costPerkWh'),
          percentElectricGoalRaw: app.reportModel.get('percentElectricGoal'),
          percentElectricGoal: String((app.reportModel.get('percentElectricGoal')*100)),
          systemSize: app.reportModel.get('systemSize'),
          averageCostSystem: app.reportModel.get('averageCostSystem'),
          averageCostSystemAsCurrency: app.reportModel.get('averageCostSystemAsCurrency'),
          paybackWithoutIncentives: app.reportModel.get('paybackWithoutIncentives'),
          paybackWithTaxCredit: app.reportModel.get('paybackWithTaxCredit'),
          paybackWithMim: app.reportModel.get('paybackWithMim'),
          madeInMn: config.madeInMn
        };

        this.$el.html(template(options));
        this.startup();
      },

      startup: function() {
        this.initComponents();
      },

      initComponents: function() {

        $('#siteName').on('keyup', function(){
          app.query.siteName = $(this).val();
        });

        $('#siteNotes').on('keyup', function(){
          app.query.siteNotes = $(this).val();
        });

        $('.downloadButton').on('click', function(){
          var doc = reportController.createPdf();
          reportController.saveToPdf(doc);
        });

        $('.printButton').on('click', function(){
          var doc = reportController.createPdf();
          reportController.printPdf(doc);
        });

        // results template
        this.results = new Results({
          el: $('.reportResults-container'),
        });

        $('#reportAngleBox').on('input', function(){
          mapController.rotatePoint();
        });

        $('.angleUpButton').on('click', function(){
          reportController.increaseAngle();
          mapController.rotatePoint();
        });

        $('.angleDownButton').on('click', function(){
          reportController.decreaseAngle();
          mapController.rotatePoint();
        });

        

        // var solarMap = new Map('reportSolarMap-container', {
        //   basemap: 'solar',
        //   center: [app.query.point.x, app.query.point.y],
        //   showAttribution: false,
        //   zoom: 13
        //     // extent: new Extent(this.config.extent)
        // });

        // // var params = new ImageParams();

        // var solarLayer = new ImageLayer(config.solarImageryUrl, {
        //   id: 'solar',
        //   // imageServiceParameters: params,
        //   showAttribution: false,
        //   opacity: 1.0
        // });

        // // Add solar to the map
        // solarMap.addLayer(solarLayer);

        // var aerialMap = new Map('reportAerialMap-container', {
        //   basemap: 'hybrid',
        //   center: [config.centerLng, config.centerLat],
        //   showAttribution: false,
        //   zoom: 13
        //     // extent: new Extent(this.config.extent)
        // });
      },

      // editTitle: function() {
      //   $('#siteTitle').val($('.reportSiteTitle').text());
      // },

      // setSiteTitle: function() {
      //   $('.reportSiteTitle').text($('#siteTitle').val());
      // },

      // hideEditTitleModal: function() {
      //   $('.editTitleModal').modal('hide');
      // },

      // ,
      
      saveSiteDetails: function(){
        var siteDetails = $('.siteDetailsValue');

        _.each(siteDetails, function(div){
          var $div = $(div);
          var savedValue = $div.val();
          var id = $div.attr('id');
          var currentValue = app.reportModel.get(id);
          if (savedValue != currentValue){
            var param = {};
            param[id] = savedValue;
            app.reportModel.set(param);
          }
        });
      },

      saveSolarCalculatorValues: function(){
        var solarCalculatorValues = $('.solarCalculatorValue');

        _.each(solarCalculatorValues, function(div){
          var $div = $(div);
          var savedValue = $div.val();
          var id = $div.attr('id');
          var currentValue = app.reportModel.get(id);
          if (savedValue != currentValue){
            var param = {};
            param[id] = parseFloat(savedValue);
            console.log(param);
            app.reportModel.set(param);
          }
        });
      },

      resetDefaultSolarCalculatorValues: function(){
        var averageUsePerMonth = config.averageUsePerMonth;
        var costPerkWh = config.costPerkWh;
        var percentElectricGoal = config.percentElectricGoal;

        // Reset the model
        app.reportModel.set({'averageUsePerMonth': averageUsePerMonth});
        app.reportModel.set({'costPerkWh': costPerkWh});
        app.reportModel.set({'percentElectricGoal': percentElectricGoal});

        // Reset the input values
        $('.averageUsePerMonth').val(averageUsePerMonth);
        $('.costPerkWh').val(costPerkWh);
        $('.percentElectricGoal').val(percentElectricGoal);

      }

    });
    return report;
  });