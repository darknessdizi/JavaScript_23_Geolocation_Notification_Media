import TimelineEdit from './TimelineEdit';
import TimelineController from './TimelineController';

const edit = new TimelineEdit();
const controller = new TimelineController(edit);
controller.init();
