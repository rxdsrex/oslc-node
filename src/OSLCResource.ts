/* eslint-disable max-len */
/* eslint-disable camelcase */
import {
  blankNode, IndexedFormula, literal, sym, NamedNode,
} from 'rdflib';
import {
  Quad_Predicate, Term, BlankNode,
} from 'rdflib/lib/tf-types';
import Namespaces from './namespaces';

interface PropertiesMap {
  [key: string]: string | string[]
}

/**
 * A store for a parsed RDF resource
 * This is a generic OSLC resource. Properties for
 * a particular domain resource will be added dynamically
 * when it is read. This allows the OSLC module to be used
 * on any domain without change or extension.
 *
 * However, subclasses could be created for any OSLC domain
 * as a convenience for those domain resources.
 *
 * @class
 */
class OSLCResource {
  /** URI of the Resource */
  id: NamedNode | BlankNode;

  /** Parsed RDF resource */
  kb: IndexedFormula;

  /** Etag of the RDF resource */
  etag?: string;

  /**
   * Initializes this Resource
   *
   * @constructor
   * @param uri - URI of the Resource
   * @param kb - Parsed RDF resource
   * @param etag - Etag of the RDF resource
   */
  constructor(uri: string, kb: IndexedFormula, etag?: string) {
    if (uri) {
      this.id = sym(uri);
      this.kb = kb;

      // TODO : Check if it still exists
      // These are not valid QNames using prefix http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/, local part can't have dots?
      // These parse ok, but don't serialize, XML qnames can have dots. This is an rdflib defect
      kb.removeMany(kb.sym(uri), kb.sym('http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/com.ibm.team.apt.attribute.complexity'));
      kb.removeMany(kb.sym(uri), kb.sym('http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/com.ibm.team.apt.attribute.acceptance'));
      kb.removeMany(kb.sym(uri), kb.sym('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.workitem.linktype.relatedworkitem.related'));
      kb.removeMany(kb.sym(uri), kb.sym('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.workitem.linktype.resolvesworkitem.resolves'));
      kb.removeMany(
        kb.sym(uri),
        kb.sym(
          'http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.build.linktype.reportedWorkItems.com.ibm.team.build.common.link.reportedAgainstBuilds',
        ),
      );
      kb.removeMany(
        kb.sym(uri),
        kb.sym('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.enterprise.promotion.linktype.promotedBuildMaps.promotedBuildMaps'),
      );
      kb.removeMany(
        kb.sym(uri),
        kb.sym(
          'http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.enterprise.promotion.linktype.promotionBuildResult.promotionBuildResult',
        ),
      );
      kb.removeMany(
        kb.sym(uri),
        kb.sym(
          'http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.enterprise.promotion.linktype.promotionDefinition.promotionDefinition',
        ),
      );
      kb.removeMany(
        kb.sym(uri),
        kb.sym('http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/com.ibm.team.enterprise.promotion.linktype.resultWorkItem.promoted'),
      );
    } else {
      this.id = blankNode();
      this.kb = new IndexedFormula();
    }
    if (etag) {
      this.etag = etag;
    }
  }

  /**
   * Set a property of the resource. This method assumes any property could
   * be multi-valued(Array). Based on open-world assumptions, it is not
   * considered an error to attempt to set a property that doesn't exist. So
   * set can be used to add new properties.
   *
   * @param property - The RDF property to set (Key)
   * @param value - The new value (Value)
   */
  set(property: string | Quad_Predicate, value: Term | string | string[] | Term[]) {
    // first remove the current values
    const p = typeof property === 'string' ? this.kb.sym(property) : property;
    const subject = this.id;
    this.kb.remove(this.kb.statementsMatching(subject, p, undefined));
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        this.kb.add(subject, p, value[i]);
      }
    } else {
      this.kb.add(subject, p, value);
    }
  }

  /**
   * Get a property of the resource. This method assumes any property could
   * be multi-valued or undefined. Based on open-world assumptions, it is not
   * considered an error to attempt to get a property that doesn't exist. This
   * would simply return null.
   *
   * @param property - The RDF property to get
   */
  get(property: string | Quad_Predicate) {
    const p = typeof property === 'string' ? this.kb.sym(property) : property;
    const result = this.kb.each(this.id, p);
    if (result && result.length === 1) {
      return result[0].value;
    } if (result && result.length > 1) {
      return result.map((v) => v.value);
    }
    return null;
  }

  /**
   * Set the resource's dcterms:title property
   *
   * @param value - The dcterms:title value to set
   */
  setTitle(value: string) {
    this.set(Namespaces.DCTERMS('title'), literal(value));
  }

  /**
   * Set the resource's dcterms:description property
   *
   * @param value - The dcterms:description value to set
   */
  setDescription(value: string) {
    this.set(Namespaces.DCTERMS('description'), literal(value));
  }

  /**
   * Get the URI of the resource
   */
  getURI() {
    return this.id.value;
  }

  /**
   * Get the resource's dcterms:identifier property
   */
  getIdentifier() {
    return this.get(Namespaces.DCTERMS('identifier'));
  }

  /**
   * Get the resource's dcterms:title property
   */
  getTitle() {
    const result = this.get(Namespaces.DCTERMS('title'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Get the resource's OSLC:shortTitle property
   */
  getShortTitle() {
    return this.get(Namespaces.OSLC('shortTitle'));
  }

  /**
   * Get the resource's dcterms:description property
   */
  getDescription() {
    const result = this.get(Namespaces.DCTERMS('description'));
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Return an Set of ObjectProperties provided by this resource
   */
  getObjectProperties() {
    const objectProperties: Set<string> = new Set();
    const statements = this.kb.statementsMatching(this.id, undefined, undefined);
    statements.forEach((statement) => {
      if (statement.object instanceof NamedNode) {
        objectProperties.add(statement.predicate.value);
      }
    });
    return objectProperties;
  }

  /**
   * Return a object of name-value pairs for all properties of by this resource
   */
  getProperties() {
    const result: PropertiesMap = Object.create(null);
    const statements = this.kb.statementsMatching(this.id, undefined, undefined);
    statements.forEach((statement) => {
      if (Object.prototype.hasOwnProperty.call(result, statement.predicate.value)) {
        let value = result[statement.predicate.value];
        if (Array.isArray(value)) {
          value.push(statement.object.value);
          result[statement.predicate.value] = value;
        } else if (typeof value === 'string') {
          const storeValue = value.substring(0);
          value = [];
          value.push(storeValue);
          value.push(statement.object.value);
          result[statement.predicate.value] = value;
        }
      } else {
        result[statement.predicate.value] = statement.object.value;
      }
    });
    return result;
  }

  /**
   * Remove a property from the resource
   * @param property - The RDF property to remove from the resource
   */
  removeProperty(property: string | Quad_Predicate) {
    const p = typeof property === 'string' ? this.kb.sym(property) : property;
    const subject = this.id;
    this.kb.remove(this.kb.statementsMatching(subject, p, undefined));
  }
}

export default OSLCResource;
