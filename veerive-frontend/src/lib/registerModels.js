import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Theme from '@/models/Theme';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import Source from '@/models/Source';
import SidebarMessage from '@/models/SidebarMessage';
import tileTemplate from '@/models/TileTemplate';
import Drivers from '@/models/Drivers';
import Region from '@/models/Region';

/**
 * Centralized model registration utility
 * Call this function in your API routes to ensure all models are properly registered
 */
export function registerModels() {
  // Register all models if not already registered
  if (!mongoose.models.Context) {
    mongoose.model('Context', Context.schema);
  }
  if (!mongoose.models.Post) {
    mongoose.model('Post', Post.schema);
  }
  if (!mongoose.models.Sector) {
    mongoose.model('Sector', Sector.schema);
  }
  if (!mongoose.models.SubSector) {
    mongoose.model('SubSector', SubSector.schema);
  }
  if (!mongoose.models.Theme) {
    mongoose.model('Theme', Theme.schema);
  }
  if (!mongoose.models.Signal) {
    mongoose.model('Signal', Signal.schema);
  }
  if (!mongoose.models.SubSignal) {
    mongoose.model('SubSignal', SubSignal.schema);
  }
  if (!mongoose.models.Source) {
    mongoose.model('Source', Source.schema);
  }
  if (!mongoose.models.SidebarMessage) {
    mongoose.model('SidebarMessage', SidebarMessage.schema);
  }
  if (!mongoose.models.TileTemplate) {
    mongoose.model('TileTemplate', tileTemplate.schema);
  }
  if (!mongoose.models.Drivers) {
    mongoose.model('Drivers', Drivers.schema);
  }
  if (!mongoose.models.Region) {
    mongoose.model('Region', Region.schema);
  }
  // Also register the lowercase 'contexts' model used in some routes
  if (!mongoose.models.contexts) {
    mongoose.model('contexts', Context.schema);
  }
}
