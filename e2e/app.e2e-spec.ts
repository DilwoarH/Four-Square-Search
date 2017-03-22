import { FourSquareSearchPage } from './app.po';

describe('four-square-search App', () => {
  let page: FourSquareSearchPage;

  beforeEach(() => {
    page = new FourSquareSearchPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
