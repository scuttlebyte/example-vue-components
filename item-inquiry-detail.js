// Styles
require('./item-inquiry-detail.scss');

// JS requires
var _ = require('lodash');
var ENV = require('.env.js');
var storage = require('store2');
var settings = require('settings.json');

// Services
var logger = require('services/log.js');
var utilities = require('services/utilities.js');

module.exports = {
	props: ['query'],
    template: require('./item-inquiry-detail.html'),
    data: function() {
	    return {
		    allLocations: false,
		    item: {},
		    edit: {
			    binLocation: false
		    }
	    }
    },
    computed: {
	    location () {
		    return this.$store.state.settings.location;
	    },
	    serials () {
		    return (this.item && this.item.serials && (this.item.serials.length > 0)) ? this.item.serials : null;
	    },
	    canEdit () {
		    return (this.$store.state.settings.options.edit && this.$store.state.settings.options.edit.item) ?
		    	this.$store.state.settings.options.edit.item : false;
	    },
	    canSubmit () {
		    return true;
	    },
	    loading () {
		    return this.$store.state.main.spinner;
	    }
    },
    created () {
		this.$store.commit('page', { title: 'Item Detail' });
	    this.$store.commit('search', {
		    display: false
		});

		if(this.$route.query.part_locations && this.$route.query.part_locations == 'all') {
			this.allLocations = true;
		}
    },
    mounted () {
		this.getItem(this.allLocations);
    },
    watch: {
	    'allLocations' (value) {
		    this.getItem(this.allLocations);
	    }
	},
    methods: {
	    getItem(all_locations) {
		    // GET request
			this.$store.dispatch('loading', true);
			this.$http.get('/modules/inventory/material/item/' + utilities.encodeItemName(this.$route.params.id), {
					params: {
						location: (all_locations) ? null : this.location
					}
				}).then((response) => {
					this.$store.dispatch('loading', false);
					if(response.data) {
						this.item = response.data;
					}
				}).catch((error) => {
					this.$store.dispatch('loading', false);
				});
	    },
	    submit (e) {
		    var vm = this;
		    e.preventDefault();

			if (this.canSubmit) {
				this.$store.dispatch('loading', true);
				this.$http.post('/modules/inventory/material/item/' + utilities.encodeItemName(this.$route.params.id), {
						item: this.item,
						location: (vm.allLocations) ? null : vm.location
					}).then((response) => {
						this.$store.dispatch('loading', false);
						if(response.data.success) {
							Materialize.toast('Successfully Saved Material Item', 3000);
							vm.getItem(vm.allLocations);
						} else {
							Materialize.toast('Error Saving Material Item: <br>' + response.data.error);
						}
					}).catch((error) => {
						this.$store.dispatch('loading', false);
						Materialize.toast('Error Saving Material Item');
					});
			}
	    }
    }
};