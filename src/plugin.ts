import { Plugin } from '@fnando/streamdeck';
import * as config from './streamdeck.json';
import quote from './actions/Quote';

const plugin = new Plugin({ ...config, actions: [quote] });

export default plugin;
