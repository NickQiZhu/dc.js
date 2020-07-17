import {format} from 'd3-format';

import {BaseMixin} from '../base/base-mixin';
import {NumberFormatFn} from '../core/types';

// Keeping these here for now, check if any other charts need same entities
interface CF {
    size (): number;
}

interface MinimalGroupAll {
    value (): number;
}

interface HTMLOptions {
    all: string;
    some: string;
}

/**
 * The data count widget is a simple widget designed to display the number of records selected by the
 * current filters out of the total number of records in the data set. Once created the data count widget
 * will automatically update the text content of child elements with the following classes:
 *
 * * `.total-count` - total number of records
 * * `.filter-count` - number of records matched by the current filters
 *
 * Note: this widget works best for the specific case of showing the number of records out of a
 * total. If you want a more general-purpose numeric display, please use the
 * {@link NumberDisplay} widget instead.
 *
 * Examples:
 * - {@link http://dc-js.github.com/dc.js/ Nasdaq 100 Index}
 * @mixes BaseMixin
 */
export class DataCount extends BaseMixin {
    private _formatNumber: NumberFormatFn;
    private _crossfilter: CF;
    private _groupAll: MinimalGroupAll;
    private _html: HTMLOptions;

    /**
     * Create a Data Count widget.
     * @example
     * var ndx = crossfilter(data);
     * var all = ndx.groupAll();
     *
     * new DataCount('.dc-data-count')
     *     .crossfilter(ndx)
     *     .groupAll(all);
     * @param {String|node|d3.selection} parent - Any valid
     * {@link https://github.com/d3/d3-selection/blob/master/README.md#select d3 single selector} specifying
     * a dom block element such as a div; or a dom element or d3 selection.
     * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
     * Interaction with a chart will only trigger events and redraws within the chart's group.
     */
    constructor (parent, chartGroup) {
        super();

        this._formatNumber = format(',d');
        this._crossfilter = null;
        this._groupAll = null;
        this._html = {some: '', all: ''};

        this._mandatoryAttributes(['crossfilter', 'groupAll']);

        this.anchor(parent, chartGroup);
    }

    /**
     * Gets or sets an optional object specifying HTML templates to use depending how many items are
     * selected. The text `%total-count` will replaced with the total number of records, and the text
     * `%filter-count` will be replaced with the number of selected records.
     * - all: HTML template to use if all items are selected
     * - some: HTML template to use if not all items are selected
     * @example
     * counter.html({
     *      some: '%filter-count out of %total-count records selected',
     *      all: 'All records selected. Click on charts to apply filters'
     * })
     * @param {{some:String, all: String}} [options]
     * @returns {{some:String, all: String}|DataCount}
     */
    public html (): HTMLOptions;
    public html (options: HTMLOptions): this;
    public html (options?) {
        if (!arguments.length) {
            return this._html;
        }
        if (options.all) {
            this._html.all = options.all;
        }
        if (options.some) {
            this._html.some = options.some;
        }
        return this;
    }

    /**
     * Gets or sets an optional function to format the filter count and total count.
     * @see {@link https://github.com/d3/d3-format/blob/master/README.md#format d3.format}
     * @example
     * counter.formatNumber(d3.format('.2g'))
     * @param {Function} [formatter=d3.format('.2g')]
     * @returns {Function|DataCount}
     */
    public formatNumber (): NumberFormatFn;
    public formatNumber (formatter: NumberFormatFn): this;
    public formatNumber (formatter?) {
        if (!arguments.length) {
            return this._formatNumber;
        }
        this._formatNumber = formatter;
        return this;
    }

    public _doRender () {
        const tot: number = this.crossfilter().size();
        const val: number = this.groupAll().value();
        const all: string = this._formatNumber(tot);
        const selected: string = this._formatNumber(val);

        if ((tot === val) && (this._html.all !== '')) {
            this.root().html(this._html.all.replace('%total-count', all).replace('%filter-count', selected));
        } else if (this._html.some !== '') {
            this.root().html(this._html.some.replace('%total-count', all).replace('%filter-count', selected));
        } else {
            this.selectAll('.total-count').text(all);
            this.selectAll('.filter-count').text(selected);
        }
        return this;
    }

    public _doRedraw () {
        return this._doRender();
    }

    public crossfilter (): CF;
    public crossfilter (cf: CF): this;
    public crossfilter (cf?) {
        if (!arguments.length) {
            return this._crossfilter;
        }
        this._crossfilter = cf;
        return this;
    }

    public groupAll ():MinimalGroupAll;
    public groupAll (groupAll:MinimalGroupAll): this;
    public groupAll (groupAll?) {
        if (!arguments.length) {
            return this._groupAll;
        }
        this._groupAll = groupAll;
        return this;
    }
}
