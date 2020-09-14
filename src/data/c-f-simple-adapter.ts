import { BaseAccessor, MinimalCFGroup, ValueAccessor } from "../core/types";
import { CFFilterHandler, ICFFilterHandlerConf } from './c-f-filter-handler';

export interface ICFSimpleAdapterConf extends ICFFilterHandlerConf {
    readonly group?: MinimalCFGroup;
    readonly valueAccessor?: ValueAccessor;
    readonly ordering?: BaseAccessor<any>;
}

export class CFSimpleAdapter extends CFFilterHandler {
    protected _conf: ICFSimpleAdapterConf;

    constructor() {
        super();

        this.configure({
            valueAccessor: d => d.value,
            ordering: d => d.key,
        });
    }

    public configure(conf: ICFSimpleAdapterConf): this {
        return super.configure(conf);
    }

    public conf(): ICFSimpleAdapterConf {
        return super.conf();
    }

    // TODO: better typing
    public data(): any {
        let entities = this._conf.group.all();

        // create a two level deep copy defensively
        entities.map(val => ({ ...val }));

        entities.forEach(e => {
            e._value = this._conf.valueAccessor(e);
        });

        return entities;
    }
}
