import { LbDemoTrackerPage } from './app.po';

describe('lb-demo-tracker App', () => {
  let page: LbDemoTrackerPage;

  beforeEach(() => {
    page = new LbDemoTrackerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
