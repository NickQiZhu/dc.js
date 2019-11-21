/* global loadDateFixture */
describe('dc.core', function () {
    let valueDimension, valueGroup;

    beforeEach(function () {
        const data = crossfilter(loadDateFixture());
        valueDimension = data.dimension(function (d) {
            return d.value;
        });
        valueGroup = valueDimension.group();
    });

    describe('version', function () {
        it('should use semantic versions', function () {
            // from https://raw.github.com/coolaj86/semver-utils/v1.0.3/semver-utils.js
            //               |optional 'v'
            //               | | 3 segment version
            //               | |                    |optional release prefixed by '-'
            //               | |                    |                                        |optional build prefixed by '+'
            const reSemver = /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/;
            expect(dc.version).toMatch(reSemver);
        });
    });

    describe('charts', function () {
        let chart;
        beforeEach(function () {
            chart = dc.pieChart('#id')
                    .dimension(valueDimension)
                    .group(valueGroup);
            spyOn(chart, 'filterAll');
            spyOn(chart, 'render');
            spyOn(chart, 'redraw');
            return chart;
        });

        it('should register chart object', function () {
            expect(dc.hasChart(chart)).toBeTruthy();
        });

        it('filterAll should invoke filter on each chart', function () {
            dc.filterAll();
            expect(chart.filterAll).toHaveBeenCalled();
        });

        it('renderAll should invoke filter on each chart', function () {
            dc.renderAll();
            expect(chart.render).toHaveBeenCalled();
        });

        it('should be gone after remove all', function () {
            dc.deregisterAllCharts();
            expect(dc.hasChart(chart)).toBeFalsy();
        });
    });

    describe('chartsRegistry', function () {
        let chart;
        let chartGrouped;
        const chartGroup = 'testChartGroup';
        beforeEach(function () {
            chart = dc.pieChart('#id')
                    .dimension(valueDimension)
                    .group(valueGroup);
            chartGrouped = dc.pieChart('#id2', chartGroup)
                    .dimension(valueDimension)
                    .group(valueGroup);
            return chart;
        });

        it('should register chart object', function () {
            expect(dc.hasChart(chart)).toBeTruthy();
        });

        it('should not have ungrouped chart after remove', function () {
            dc.deregisterChart(chart);
            expect(dc.hasChart(chart)).toBeFalsy();
        });

        it('should not have grouped chart after remove', function () {
            dc.deregisterChart(chartGrouped, chartGroup);
            expect(dc.hasChart(chartGrouped)).toBeFalsy();
        });

        it('should have switched to an existing group', function () {
            chart.chartGroup(chartGroup);
            expect(dc.hasChart(chart)).toBeTruthy();
            expect(dc.chartRegistry.list(chartGroup).indexOf(chart) > -1).toBeTruthy();
            expect(dc.chartRegistry.list(null).indexOf(chart) > -1).toBeFalsy();
        });

        it('should have switched to the global group', function () {
            chart.chartGroup(null);
            expect(dc.hasChart(chart)).toBeTruthy();
            expect(dc.chartRegistry.list(chartGroup).indexOf(chart) > -1).toBeFalsy();
            expect(dc.chartRegistry.list(null).indexOf(chart) > -1).toBeTruthy();
        });
    });

    describe('transition', function () {
        let selections;

        beforeEach(function () {
            selections = {
                transition: function () {
                    return this;
                },
                duration: function () {
                    return this;
                },
                delay: function () {
                    return this;
                }
            };
            spyOn(selections, 'transition').and.callThrough();
            spyOn(selections, 'duration').and.callThrough();
            spyOn(selections, 'delay').and.callThrough();
        });

        describe('normal', function () {
            it('transition should be activated with duration', function () {
                dc.transition(selections, 100, 100);
                expect(selections.transition).toHaveBeenCalled();
                expect(selections.duration).toHaveBeenCalled();
                expect(selections.delay).toHaveBeenCalled();
                expect(selections.duration).toHaveBeenCalledWith(100);
                expect(selections.delay).toHaveBeenCalledWith(100);
            });
            it('with name', function () {
                dc.transition(selections, 100, 100, 'transition-name');
                expect(selections.transition).toHaveBeenCalled();
                expect(selections.transition).toHaveBeenCalledWith('transition-name');
            });
        });

        describe('skip', function () {
            it('transition should not be activated with 0 duration', function () {
                dc.transition(selections, 0, 0);
                expect(selections.transition).not.toHaveBeenCalled();
                expect(selections.duration).not.toHaveBeenCalled();
                expect(selections.delay).not.toHaveBeenCalled();
            });

            it('transition should not be activated with dc.disableTransitions', function () {
                dc.config.disableTransitions = true;
                dc.transition(selections, 100);
                expect(selections.transition).not.toHaveBeenCalled();
                expect(selections.duration).not.toHaveBeenCalled();
            });

            afterEach(function () {
                dc.config.disableTransitions = false;
            });
        });

        describe('parameters', function () {
            it('duration should not be called if skipped', function () {
                dc.transition(selections);
                expect(selections.duration).not.toHaveBeenCalled();
            });

            it('delay should not be called if skipped', function () {
                dc.transition(selections, 100);
                expect(selections.delay).not.toHaveBeenCalled();
            });
        });
    });

    describe('units', function () {
        describe('.integers', function () {
            let result;
            beforeEach(function () {
                result = dc.units.integers(0, 100);
            });
            it('units should be based on subtraction', function () {
                expect(result).toEqual(100);
            });
        });

        describe('.float', function () {
            let result;
            beforeEach(function () {
                result = dc.units.fp.precision(0.001)(0.49999, 1.0);
            });
            it('units should be generated according to the precision', function () {
                expect(result).toEqual(501);
            });
        });

        describe('.ordinal', function () {
            it('should throw - it\'s a placeholder only', function () {
                expect(dc.units.ordinal).toThrow(new Error('dc.units.ordinal should not be called - it is a placeholder'));
            });
        });
    });

    describe('charts w/ grouping', function () {
        let chart;

        beforeEach(function () {
            chart = dc.pieChart('#a', 'groupA').dimension(valueDimension).group(valueGroup);
            spyOn(chart, 'filterAll');
            spyOn(chart, 'render');
            dc.pieChart('#b', 'groupA').dimension(valueDimension).group(valueGroup);
            dc.bubbleChart('#c', 'groupB').dimension(valueDimension).group(valueGroup);
            dc.barChart('#b1', 'groupB').dimension(valueDimension).group(valueGroup);
            dc.lineChart('#b2', 'groupB').dimension(valueDimension).group(valueGroup);
            dc.dataCount('#b3', 'groupB').dimension(valueDimension).group(valueGroup);
            dc.dataTable('#b4', 'groupB').dimension(valueDimension).group(valueGroup);
            return chart;
        });

        it('should register chart object', function () {
            expect(dc.hasChart(chart)).toBeTruthy();
        });

        it('filterAll by group should invoke filter on each chart within the group', function () {
            dc.filterAll('groupA');
            expect(chart.filterAll).toHaveBeenCalled();
        });

        it('renderAll by group should invoke filter on each chart within the group', function () {
            dc.renderAll('groupA');
            expect(chart.render).toHaveBeenCalled();
        });

        it('filterAll should not invoke filter on chart in groupA', function () {
            dc.filterAll();
            expect(chart.filterAll).not.toHaveBeenCalled();
        });

        it('renderAll should not invoke filter on chart in groupA', function () {
            dc.renderAll();
            expect(chart.render).not.toHaveBeenCalled();
        });

        it('should be gone after remove all', function () {
            dc.deregisterAllCharts();
            expect(dc.hasChart(chart)).toBeFalsy();
        });
    });

    describe('render/redraw all call back', function () {
        let result;

        beforeEach(function () {
            dc.renderlet(function (group) {
                result.called = group ? group : true;
            });
            result = {called: false};
        });

        it('renderAll call back should be triggered', function () {
            dc.renderAll();
            expect(result.called).toBeTruthy();
        });

        it('redrawAll call back should be triggered', function () {
            dc.redrawAll();
            expect(result.called).toBeTruthy();
        });

        it('renderAll by group call back should be triggered', function () {
            dc.renderAll('group');
            expect('group').toEqual(result.called);
        });

        it('redrawAll by group call back should be triggered', function () {
            dc.redrawAll('group');
            expect('group').toEqual(result.called);
        });
    });
});
