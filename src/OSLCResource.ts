/* eslint-disable camelcase */
import Namespaces from 'namespaces';
import {
  BlankNode, blankNode, IndexedFormula, Literal, literal, NamedNode, sym,
} from 'rdflib';
import { Quad_Predicate } from 'rdflib/lib/tf-types';

class OSLCResource {
  id: NamedNode | BlankNode;

  kb: IndexedFormula;

  etag?: string;

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

  getURI() {
    return this.id.value;
  }

  get(property: string | Quad_Predicate) {
    const p = typeof property === 'string' ? this.kb.sym(property) : property;
    const result = this.kb.each(this.id, p);
    if (result.length === 1) {
      return result[0].value;
    } if (result.length > 1) {
      return result.map((v) => v.value);
    }
    return null;
  }

  set(property: string | Quad_Predicate, value: string | Literal | string[]) {
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

  getIdentifier() {
    return this.get(Namespaces.DCTERMS('identifier'));
  }

  getTitle() {
    const result = this.get(Namespaces.DCTERMS('title'));
    return Array.isArray(result) ? result[0] : result;
  }

  getShortTitle() {
    return this.get(Namespaces.OSLC('shortTitle'));
  }

  getDescription() {
    const result = this.get(Namespaces.DCTERMS('description'));
    return Array.isArray(result) ? result[0] : result;
  }

  setTitle(value: string) {
    this.set(Namespaces.DCTERMS('title'), literal(value));
  }

  setDescription(value: string) {
    this.set(Namespaces.DCTERMS('description'), literal(value));
  }

  getLinkTypes() {
    const linkTypes = new Set();
    const statements = this.kb.statementsMatching(this.id, undefined, undefined);
    for (const statement of statements) {
      if (statement.object instanceof NamedNode) linkTypes.add(statement.predicate.value);
    }
    return linkTypes;
  }

  getProperties() {
    const result: { [key: string]: string | string[]} = {};
    const statements = this.kb.statementsMatching(this.id, undefined, undefined);
    for (const statement of statements) {
      if (typeof result[statement.predicate.value] !== 'undefined') {
        if (Array.isArray(result[statement.predicate.value])) {
          result[statement.predicate.value] = [...result[statement.predicate.value], statement.object.value];
        } else {
          result[statement.predicate.value] = [result[statement.predicate.value] as string, statement.object.value];
        }
      } else {
        result[statement.predicate.value] = statement.object.value;
      }
    }
    return result;
  }
}
