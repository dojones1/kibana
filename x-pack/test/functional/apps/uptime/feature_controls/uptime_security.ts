/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import expect from '@kbn/expect';
import { SecurityService } from '../../../../common/services';
import { KibanaFunctionalTestDefaultProviders } from '../../../../types/providers';

// eslint-disable-next-line import/no-default-export
export default function({ getPageObjects, getService }: KibanaFunctionalTestDefaultProviders) {
  const esArchiver = getService('esArchiver');
  const security: SecurityService = getService('security');
  const PageObjects = getPageObjects(['common', 'error', 'timePicker', 'security']);
  const testSubjects = getService('testSubjects');
  const appsMenu = getService('appsMenu');

  describe('security', () => {
    before(async () => {
      await esArchiver.load('empty_kibana');
      // ensure we're logged out so we can login as the appropriate users
      await PageObjects.security.forceLogout();
    });

    after(async () => {
      // logout, so the other tests don't accidentally run as the custom users we're testing below
      await PageObjects.security.forceLogout();
    });

    describe('global uptime all privileges', () => {
      before(async () => {
        await security.role.create('global_uptime_all_role', {
          elasticsearch: {
            indices: [{ names: ['logstash-*'], privileges: ['read', 'view_index_metadata'] }],
          },
          kibana: [
            {
              feature: {
                uptime: ['all'],
              },
              spaces: ['*'],
            },
          ],
        });

        await security.user.create('global_uptime_all_user', {
          password: 'global_uptime_all_user-password',
          roles: ['global_uptime_all_role'],
          full_name: 'test user',
        });

        await PageObjects.security.login(
          'global_uptime_all_user',
          'global_uptime_all_user-password',
          {
            expectSpaceSelector: false,
          }
        );
      });

      after(async () => {
        await security.role.delete('global_uptime_all_role');
        await security.user.delete('global_uptime_all_user');
      });

      it('shows uptime navlink', async () => {
        const navLinks = await appsMenu.readLinks();
        expect(navLinks.map((link: Record<string, string>) => link.text)).to.eql([
          'Uptime',
          'SIEM',
          'Management',
        ]);
      });

      it('can navigate to Uptime app', async () => {
        await PageObjects.common.navigateToApp('uptime');
        await testSubjects.existOrFail('uptimeApp', 10000);
      });
    });

    describe('global uptime read-only privileges', () => {
      before(async () => {
        await security.role.create('global_uptime_read_role', {
          elasticsearch: {
            indices: [{ names: ['logstash-*'], privileges: ['read', 'view_index_metadata'] }],
          },
          kibana: [
            {
              feature: {
                uptime: ['read'],
              },
              spaces: ['*'],
            },
          ],
        });

        await security.user.create('global_uptime_read_user', {
          password: 'global_uptime_read_user-password',
          roles: ['global_uptime_read_role'],
          full_name: 'test user',
        });

        await PageObjects.security.login(
          'global_uptime_read_user',
          'global_uptime_read_user-password',
          {
            expectSpaceSelector: false,
          }
        );
      });

      after(async () => {
        await security.role.delete('global_uptime_read_role');
        await security.user.delete('global_uptime_read_user');
      });

      it('shows uptime navlink', async () => {
        const navLinks = (await appsMenu.readLinks()).map(
          (link: Record<string, string>) => link.text
        );
        expect(navLinks).to.eql(['Uptime', 'Management']);
      });

      it('can navigate to Uptime app', async () => {
        await PageObjects.common.navigateToApp('uptime');
        await testSubjects.existOrFail('uptimeApp', 10000);
      });
    });

    describe('no uptime privileges', () => {
      before(async () => {
        await security.role.create('no_uptime_privileges_role', {
          elasticsearch: {
            indices: [{ names: ['logstash-*'], privileges: ['read', 'view_index_metadata'] }],
          },
          kibana: [
            {
              feature: {
                dashboard: ['all'],
              },
              spaces: ['*'],
            },
          ],
        });

        await security.user.create('no_uptime_privileges_user', {
          password: 'no_uptime_privileges_user-password',
          roles: ['no_uptime_privileges_role'],
          full_name: 'test user',
        });

        await PageObjects.security.login(
          'no_uptime_privileges_user',
          'no_uptime_privileges_user-password',
          {
            expectSpaceSelector: false,
          }
        );
      });

      after(async () => {
        await security.role.delete('no_uptime_privileges_role');
        await security.user.delete('no_uptime_privileges_user');
      });

      it(`doesn't show uptime navlink`, async () => {
        const navLinks = (await appsMenu.readLinks()).map(
          (link: Record<string, string>) => link.text
        );
        expect(navLinks).not.to.contain('Uptime');
      });

      it(`renders not found page`, async () => {
        await PageObjects.common.navigateToUrl('uptime', '', {
          ensureCurrentUrl: false,
          shouldLoginIfPrompted: false,
        });
        await PageObjects.error.expectNotFound();
      });
    });
  });
}