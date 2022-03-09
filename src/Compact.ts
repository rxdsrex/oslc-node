/* eslint-disable camelcase */
import { Quad_Subject } from 'rdflib/lib/tf-types';
import Namespaces from './namespaces';
import OSLCResource from './OSLCResource';

/**
 * Implements OSLC Compact resource to support OSLC Resource Preview
 *
 * @class
 * @extends OSLCResource
 */
class Compact extends OSLCResource {
  /**
   * Get the resource's OSLC:icon property
   */
  getIcon() {
    return this.get(Namespaces.OSLC('icon'));
  }

  /**
   * Get the resource's OSLC:iconTitle property
   */
  getIconTitle() {
    return this.get(Namespaces.OSLC('iconTitle'));
  }

  /**
   * Get the resource's OSLC:iconSrcSet property
   */
  getIconSrcSet() {
    return this.get(Namespaces.OSLC('iconSrcSet'));
  }

  /**
   * Get the resource's small preview
   */
  getSmallPreview() {
    const preview = this.kb.the(this.id, Namespaces.OSLC('smallPreview'));
    if (!preview) return null;
    const hintHeight = this.kb.the(preview as Quad_Subject, Namespaces.OSLC('hintHeight'));
    const hintWidth = this.kb.the(preview as Quad_Subject, Namespaces.OSLC('hintWidth'));
    return {
      document: this.kb.the(preview as Quad_Subject, Namespaces.OSLC('document'))?.value,
      hintHeight: hintHeight?.value,
      hintWidth: hintWidth?.value,
    };
  }

  /**
   * Get the resource's large preview
   */
  getLargePreview() {
    const preview = this.kb.the(this.id, Namespaces.OSLC('largePreview'));
    if (!preview) return null;
    const hintHeight = this.kb.the(preview as Quad_Subject, Namespaces.OSLC('hintHeight'));
    const hintWidth = this.kb.the(preview as Quad_Subject, Namespaces.OSLC('hintWidth'));
    return {
      document: this.kb.the(preview as Quad_Subject, Namespaces.OSLC('document'))?.value,
      hintHeight: hintHeight?.value,
      hintWidth: hintWidth?.value,
    };
  }
}

export default Compact;
